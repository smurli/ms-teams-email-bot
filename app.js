var restify = require('restify');
var fs = require('fs');
var builder = require('botbuilder');
var teams = require("botbuilder-teams");
const nodemailer = require('nodemailer');

var connector = new teams.TeamsChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var server = restify.createServer();
server.listen(process.env.bot_port || process.env.BOT_PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

/**
 * 
 * @param {Object} from - Object with memebers 'name' and 'email' 
 * @param {Object[]} to - Array of Objects with members 'name' and 'email'
 * @param {String} message  - string message to be sent as email body.
 */
function sendMail(session, from, to, cc, message) {
    var subject = "You attention is requested in a teams conversation";

    var transporter = nodemailer.createTransport({
        host: 'us-smtp-inbound-1.mimecast.com', // Office 365 server
        port: 25,     
        secure: false, 
        tls: {
            ciphers: 'SSLv3'
        }
    });

    var fromAddr = from.name + " <" + from.email +">";
    var ccAddr = cc.name + " <" + cc.email +">";
    var toAddr = "";
    for (var i=0; i<to.length; i++) {
        if(toAddr) {
            toAddr.concat(", ")
        }
        toAddr = toAddr.concat(to[i].name + " <" + to[i].email + ">")
    }

    mailText = "You attention is requested by " + from.name + " in a teams conversation:\n" 
    mailText = mailText + (("https://teams.microsoft.com/_#/conversations/none?threadId=" + session.message.address.conversation.id).replace("skype;messageid", "skype&messageid"));
    mailText = mailText + "\n\nMessage:\n" + message;

    // setup e-mail data
    var mailOptions = {
        from: fromAddr,
        to: toAddr,
        subject: subject,
        text: mailText
        //html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
    if(error){
        session.send("Failed to send email. Error:" + error);
        session.endDialog();
        return;
    } else {
        session.send("Email Sent to:" + toAddr);
        session.endDialog();
        console.log("Mail Sent");
    }
});

};

server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector, [
    function (session) {
        console.log("Message Received");
        var mentions = [];
        for (var i=0; i<session.message.entities.length; i++) {
            o = session.message.entities[i];
            if(o.type == "mention") {
                mentions.push(o.mentioned.name);
            }
        }
        //Fetch members
        var conversationId = session.message.address.conversation.id;
        var res = null;
        connector.fetchMembers(
            (session.message.address).serviceUrl,
            conversationId,
            (err, result) => {
                if (err) {
                    console.log("Failed to Fetch Members.Error:"+err);
                }
                else {
                    var arrayLength = result.length;
                    var memberAddr = {};
                    for(var i = 0; i < arrayLength; i++)
                    {
                        memberAddr[result[i].name] = result[i].email;
                    }
                    toAddr = [];
                    for(var i=0;i<mentions.length;i++) {
                        if(mentions[i] in memberAddr ) {
                            var addr = {name:mentions[i], email:memberAddr[mentions[i]]};
                            toAddr.push(addr);
                        }
                    }
                    var fromAddr = {name:session.message.user.name, email:"noreply@parallelwireless.com"};
                    var ccAddr = {name:session.message.user.name, email:memberAddr[session.message.user.name]};
                    sendMail(session, fromAddr, toAddr, ccAddr, session.message.text);
                }
            }
        );
    }
]);
var stripBotAtMentions = new teams.StripBotAtMentions();
bot.use(stripBotAtMentions);
bot.set(`persistUserData`, false);
bot.set(`persistConversationData`, false);
bot.set("storage", null);
