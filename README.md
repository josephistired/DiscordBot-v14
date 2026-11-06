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
- Polls persist votes and totals in MongoDB. Duplicate votes remain blocked across
  restarts. Discord message edits are serialized within one bot process.
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

## Features from the issue backlog

### Economy ([#66](https://github.com/josephistired/DiscordBot-v14/issues/66))

All accounts are scoped to the server and user. Coins are virtual collectibles.

| Command                      | Behavior                                       |
| ---------------------------- | ---------------------------------------------- |
| `/economy balance [user]`    | Wallet and bank balances                       |
| `/economy daily`             | 250 coins, available every 24 hours            |
| `/economy work`              | 50 coins, available every hour                 |
| `/economy deposit amount`    | Move wallet coins into the bank                |
| `/economy withdraw amount`   | Move bank coins into the wallet                |
| `/economy pay user amount`   | Transfer wallet coins to another server member |
| `/economy leaderboard`       | Top 10 server members by wallet plus bank      |
| `/economy shop`              | Show collectible prices                        |
| `/economy buy item`          | Buy a cookie or trophy                         |
| `/economy inventory`         | Show purchased collectibles                    |
| `/economy grant user amount` | Grant coins; requires Manage Server            |

Wallets and banks each have a limit of 1,000,000,000 coins. Rewards, bank moves,
and purchases use conditional single-document updates. Payments use MongoDB
transactions and require **MongoDB Atlas or a replica set**. Standalone MongoDB
cannot execute payments; failed transactions do not debit either account. New
collections have unique account/poll indexes; startup/database credentials must
permit index creation.

### Verification ([#65](https://github.com/josephistired/DiscordBot-v14/issues/65))

1. Create a low-privilege Verified role below the bot's highest role. Do not use
   the automatic welcome role or a role with administrative/moderation powers.
2. Keep a public, read-only verification lobby outside protected categories. Deny
   @everyone Send Messages, Send Messages in Threads, and creating threads.
3. Run `/verification setup channel role` to publish the persistent Verify button.
4. Give existing trusted members the Verified role before gating their channels.
5. Run `/verification protect category confirm:true` for each public category to
   gate. You need Manage Server and Manage Channels; the bot needs Manage Roles
   and channel-management access. Only categories whose children all inherit
   their permissions are accepted. Conflicting View Channel allows are refused.
6. Use `/verification status` to inspect the lobby/role. To undo protection, run
   `/verification unprotect category confirm:true`. This restores the saved
   original category overwrites, replacing later manual changes to those overwrites.

Verification grants a role after a button click. It is not a CAPTCHA, age check,
or identity check, and cannot stop Discord DMs. Administrators bypass Discord
channel restrictions. Private categories are never automatically opened to the
Verified role. Channels outside protected categories, future custom overwrites,
and roles granted by other bots must be reviewed by server admins. Permission
snapshots are stored before protection so failed Discord edits can be retried or
restored. Unprotect existing categories before changing the verified role.

### Persistent polls ([#64](https://github.com/josephistired/DiscordBot-v14/issues/64))

`/poll question` publishes a Yes/No button poll. Each user gets one persistent
vote per server/message. Vote storage is authoritative, even if a Discord message
edit fails; retrying refreshes the displayed totals without counting twice.
Older polls retain their displayed totals when first adopted, but voters from
before this update cannot be reconstructed and may vote once after the upgrade.
Run one bot process for serialized poll display updates. MongoDB stores voter IDs
and choices until the poll record is removed by the host; there is no automatic
retention policy.

### Configurable logging ([#38](https://github.com/josephistired/DiscordBot-v14/issues/38))

Use `/log-set channel` and `/log-options event enabled`. Categories are commands,
moderation, members, messages, channels, roles, bans, voice, server, invites, and
emojis; `all` toggles every category. Existing configurations default to enabled.
Configuration is separate per server. Membership and voice changes, message
edits/deletions, channel and role changes, bans, invites, emojis, and basic server
changes are logged. Log-channel messages are excluded to prevent recursive logs.

Message logs include cached text; uncached deleted content cannot be recovered.
Gateway events do not always identify the moderator responsible, so these logs do
not claim audit-log attribution. Invite events require the bot's Manage Channels
permission in the relevant channel; ban events require the relevant moderation
permissions. The Server Members and Message Content privileged intents must be
allowed in the Developer Portal. Logging is not a complete Discord audit trail.
