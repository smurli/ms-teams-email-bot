# ms-teams-email-bot
A bot for MS Teams to send email notifications to @mentioned users with the conversation message.
MS Teams in built email notification doesn't send the message content in the email and hence the receiver has the tendency to ignore email notifications like a spam notification. By sending a email notification with the message content the receiver is most likely to respond.

# Installation
```
git clone https://github.com/smurli/ms-teams-email-bot.git
cd ms-teams-email-bot
npm install
```

# Running the bot
Register the bot in site, dev.botframework.com, and get a bot ID and password. Set the bot ID and password in the environment variable as mentioned below.
```
export MICROSOFT_APP_ID="<bot-id>"
export  MICROSOFT_APP_PASSWORD="<bot-password>"
export BOT_PORT=3978
cd <clone path>/ms-teams-email-bot
node app.js
```
