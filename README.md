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

## Modernization notes

- Discord.js is pinned to 14.28.1. First-party code uses `Events.ClientReady`,
  `MessageFlags.Ephemeral`, and guild interaction contexts.
- Command names and MongoDB collection names remain unchanged. `/purge amount` is
  now an integer, and the unsupported `/kick messages` option was removed because
  Discord kicks cannot delete message history. Bans delete up to seven days of
  messages using `deleteMessageSeconds`.
- Slow API, giveaway, and moderation operations acknowledge interactions before
  doing work. Shared social commands increment and display the updated count.
- The create/edit anti-link handlers share enforcement and preserve disabled
  settings. Ensure the bot has Moderate Members, Ban Members, Manage Messages,
  and access to the configured logging channel for this feature.
- Polls keep transient votes across event reloads and serialize updates in one
  bot process. Vote history is bounded to 1,000 polls and resets on restart; it
  is not durable or synchronized across multiple bot processes.
- `npm run check` checks JavaScript syntax. CI runs installation, syntax checks,
  and offline regression tests on Node 22 and 24.

Before deploying, test commands, welcome messages, poll voting, giveaways, and
anti-link enforcement in a private Discord server with a test MongoDB database.
Offline tests do not verify Discord permissions, external API availability, or
live gateway behavior.

Dependency audit: the updated lockfile has no critical findings, but six production
findings remain in `discord-giveaways` and `discord-html-transcripts` dependency
chains (five high and one moderate at the time of this update). Transcripts are
pinned to 3.2.0 because the maintainer marks 3.3.0 as broken. These dependencies
need further review or replacement before treating this bot as production-ready.

### Additional command updates

Giveaways use delayed initialization from `Events.ClientReady`; this avoids the
legacy `ready` listener inside discord-giveaways 6.0.1. Do not suppress Node
deprecation warnings. If another warning remains, run `node --trace-deprecation .`
to identify its caller.

`/status`, `/avatar`, and `/games` no longer require a working database. Status
reports process memory in MiB and uses current channel types. Avatar accepts a
selected user even if they are not in the server. Multiplayer games reject bot
opponents and self-challenges. `/log-set` and `/welcome setup` validate the bot's
channel permissions before saving, and welcome roles must be below the bot's
highest role.
