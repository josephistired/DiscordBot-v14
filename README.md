<div align="center">
  <h1>⚠️ Important Notice: This Discord Bot is No Longer Actively Maintained ⚠️</h1>
</div>

<p align="center">Dear Github Users!</p>

<p align="center">Due to my ongoing academic commitments and the demands of school, I regret to inform you that I am unable to continue active development and support for this project. While the bot remains available for use, please be aware of the following:</p>

<ul>
  <li>No new features or updates will be provided.</li>
  <li>Critical bug fixes and security updates may not be addressed promptly.</li>
  <li>Support for issues and inquiries may be limited.</li>
</ul>

<p align="center">I want to express my gratitude to all of you who have used this project. Your enthusiasm and feedback have been greatly appreciated.</p>

<p align="center">If you have any pressing concerns or questions, you can still reach out via the GitHub issues tab. However, please understand that my responses may be delayed.</p>

<p align="center">Thank you for your understanding, and I hope to return to active development when my schedule permits.</p>

<p align="center">Sincerely, Joseph.</p>

<div align="center">

# 🤖 DiscordBot-v14

A self-hosted, open-source Discord bot built on Discord.js v14. Includes moderation, utilities, fun commands, welcome system, logging, anti-link protection, and more.

[![Maintenance](https://img.shields.io/maintenance/no/2023?style=social)](https://docs.josephcarmosino.com/discordbot-v14)

</div>

---

## 📚 Documentation

➡️ [Full Docs Site](https://docs.josephcarmosino.com/discordbot-v14)

The docs include:

- Getting Started
- Full Command-List
- Feature Breakdown
- Security & Deployment Best Practices
- Code Examples

---

## Development

Copy `.env.example` to `.env` and set `TOKEN`, `DATABASEURL`, and `DEVELOPERID`.
Enable the Server Members and Message Content privileged intents in the Discord
Developer Portal. Invite the bot with the `bot` and `applications.commands` scopes
and permissions appropriate to the commands you use.

```sh
npm ci
npm start
```

The database connects before login. Startup failures exit with a nonzero status.
Slash commands register globally when the client becomes ready. Developer reload
commands replace only this bot's loaded handlers and await command registration.

- `npm run dev`: restart on file changes with nodemon.
- `npm test`: offline regression tests, without a bot token or database.
- `DEFAULT_COOLDOWN`: default command cooldown in seconds (defaults to 3).
  `COMMAND_COOLDOWN` takes precedence when set; individual command `cooldown`
  values override either setting. Administrators bypass cooldowns.

The core refactor preserves command names and database schemas. Dependency upgrades
and live Discord/MongoDB integration verification remain separate work.
