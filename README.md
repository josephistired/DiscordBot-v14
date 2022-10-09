![discord.js](https://discordjs.guide/meta-image.png)

# DiscordBot-v14

A very simple discord bot based on [discord.js](https://discord.js.org/#/) v14!

## Prerequisites

1. Discord Bot Token **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**  
   1.1. Enable MESSAGE CONTENT INTENT & PRESENCE INTENT & SERVER MEMBERS INTENT & MESSAGE CONTENT INTENT in your Discord Developer Portal. **[Image](https://ibb.co/sgLLypg)**
2. Discord Account Token **[Guide](https://www.businessinsider.com/guides/tech/discord-id)**
3. Node.js 16.17.1 LTS or newer. **[Download](https://nodejs.org/en/)**
4. MongoDB Database Needed **[Please Follow This Guide](https://youtu.be/BEkyfqlbVRw)**

## 🖥️ First Things To Do

```
git clone https://github.com/josephistired/DiscordBot-v14.git
cd DiscordBot-v14
npm install
```

**After you have completed running those commands follow the Configuration guide below. Then run the command `nodemon`**

## ✅ Configuration

_Edit the config.json file in the Configuration folder._

```json
{
  "Token": "Place Your Token Here!",
  "DatabaseURL": "Place Your Database Url Here!"
}
```

_Edit the SlashCommand.js file in the Events/Interactions Folder_

```js
if (command.developer && interaction.user.id !== "Place Your Discord Account ID Here.")
```

## Commands

| Command            | Description                                            | Group      | Working                                                      |
| ------------------ | ------------------------------------------------------ | ---------- | ------------------------------------------------------------ |
| info               | Displays information on bot & this repo.               | Developer  | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| reload commands    | Reloads the bot commands                               | Developer  | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| reload events      | Reloads the events                                     | Developer  | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| infractions remove | Remove user's infraction count                         | Moderation | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| infractions view   | View user's infraction count                           | Moderation | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| ban                | Bans user from server                                  | Moderation | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| kick               | Kicks user from server                                 | Moderation | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| cuddle             | Cuddle another user                                    | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| 8ball              | A 8ball that answers all your questions                | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| hug                | Hug another user                                       | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| kiss               | Kiss another user                                      | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| size               | Displays 8====D size of other user                     | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| slap               | Slap another user                                      | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| tickle             | Tickle another user                                    | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| wink               | Wink at other user                                     | Fun        | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| avatar             | Display avatar of another user                         | Utilities  | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| ip                 | Displays info about given ip                           | Utilities  | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |
| status             | Displays the status of the bot and database connection | Utilities  | <img src="./Assets/checkmark.gif" width="25%" height="25%"/> |

## Future Command & Systems

| System / Command            | Description                 | Status                                                        |
| --------------------------- | --------------------------- | ------------------------------------------------------------- |
| Image Manipulation Commands | Alter another user's avatar | <img src="./Assets/comingsoon.gif" width="25%" height="25%"/> |
| More Moderation Commands    | Moderation Commands         | <img src="./Assets/comingsoon.gif" width="25%" height="25%"/> |
| More Fun Commands           | Fun Commands                | <img src="./Assets/comingsoon.gif" width="25%" height="25%"/> |
| Giveaway System             | Giveaway System             | Researching                                                   |
| Ticket System               | Ticket System               | Researching                                                   |
| Music System                | Music System                | .....                                                         |

## Acknowledgements

Shout to Lyxcode on Youtube, this bot is based off his series with a twist of my own.

1. [Events Handler](https://www.youtube.com/watch?v=Mug61R0cxRw)
2. [Command Handler](https://www.youtube.com/watch?v=1eKV2_WsWR0)
3. [MongoDB](https://www.youtube.com/watch?v=BEkyfqlbVRw&t=3s)
4. [Timeout Command](https://www.youtube.com/watch?v=J8jp6ri1lYo)

Shout to others using code-share on Lyx's Discord Server, I took a few of their commands.

1. [Status Command](https://github.com/KevinFoged)

## License

[](https://choosealicense.com/licenses/mit/)
