# A quick update from Joseph

I'm back for an update, but my interest in building Discord bots isn't what it
used to be. This project is something I'll work on occasionally, rather than a
main focus, so please don't expect regular releases or quick support.

This update was vibe coded with AI assistance under my oversight. I'm reviewing
and testing the changes, but that doesn't mean everything will be perfect.

If you find a bug or have a feature request, please [open an issue](https://github.com/josephistired/DiscordBot-v14/issues).
Include what happened, what you expected, steps to reproduce it, and any relevant
logs with tokens and other secrets removed. Reports and contributions are welcome,
but I can't promise a response or a fix on a particular timeline.

Thanks for sticking around.

<div align="center">

# 🤖 DiscordBot-v14

A self-hosted, open-source Discord bot built on Discord.js v14. Includes moderation, utilities, fun commands, welcome system, logging, anti-link protection, and more.

![Maintenance: occasional](https://img.shields.io/badge/maintenance-occasional-yellow)

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

Use **Node.js 22.12 or newer** (Node 24 LTS is recommended; `.nvmrc` selects 24).

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
