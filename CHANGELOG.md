# Changelog

## 1.1.0 (unreleased)

This release returns the project to occasional maintenance. It was developed with
AI assistance under Joseph's oversight. Bug reports and contributions are welcome;
regular releases and response times are not promised.

### Added

- Server-specific economy: wallet/bank balances, daily and work rewards, transfers,
  leaderboards, collectible shop/inventory, and permission-checked coin grants.
- Persistent verification panels, explicit public-category protection, and recovery
  of original permission overwrites through `/verification unprotect`.
- Persistent poll votes and totals, including duplicate protection after restarts.
- Per-server logging categories covering membership, messages, channels, roles,
  moderation, voice, server changes, invites, and emojis.
- Node 22/24 CI with syntax, regression, dependency-compatibility, and audit checks.

### Changed

- Upgrade Discord.js to 14.28.1 and require Node.js 22.12 or newer. Node 24 is
  recommended.
- Use current Discord.js event, interaction response, and guild-context APIs.
- Match the existing builder/subcommand file structure and success/error embeds.
- Use a neutral poll card, clear Yes/No labels, and emoji-based event logs.
- Display a shared hug total for both directions of a pair, preserving old history.
- Report version 1.1.0 in `/info`.

### Fixed

- Per-command cooldown isolation and handling of asynchronous command failures.
- Startup ordering, giveaway initialization, failed command registration recovery,
  duplicate event listeners, and event reloads.
- Ban/kick/timeout API usage, validation, permissions, and role hierarchy checks.
- Purge filtering, awaited message deletion/transcripts, and integer message counts.
- Disabled anti-link settings being overwritten, edited-message handling, and
  moderation logs.
- Missing logging image attachments, invalid banner links, and incorrect status
  memory labels and channel types.
- Setup channel/role validation, avatar lookup for non-members, and invalid
  multiplayer opponents.

### Dependency security

Keep `discord-giveaways` 6.0.1 and `discord-html-transcripts` 3.2.0, with narrowly
scoped dependency overrides:

| Parent package             | Dependency             | Override |
| -------------------------- | ---------------------- | -------- |
| `discord-giveaways`        | `deepmerge-ts`         | `8.0.2`  |
| `discord-giveaways`        | `serialize-javascript` | `7.1.4`  |
| `discord-html-transcripts` | `undici`               | `6.29.1` |

These replace the vulnerable merge, serialization, and HTTP dependency chains.
Transcript 3.3.0 is explicitly marked broken by its maintainer, so it is not used.
The overrides cross dependency major versions; regression tests exercise the APIs
used by the bot: giveaway creation/editing/pausing, persisted function data,
transcript image downloads, HTML output, and attachment generation.

A full `npm audit` reported zero known vulnerabilities when this release was
prepared. This is a point-in-time dependency check, not a guarantee of future
security. Review the overrides when either parent package receives an update.

### Upgrade notes

1. Use Node.js 22.12 or newer, back up the database, and install with `npm ci`.
2. Run `npm run check` and `npm test` before starting the bot.
3. `/purge amount` now accepts integers. `/kick messages` was removed because
   Discord kicks do not delete message history.
4. Economy payments require MongoDB Atlas or a replica set with transaction
   support. New account/poll/verification collections require index creation.
5. Keep the verification lobby public and read-only, outside protected categories.
   Assign the verified role to existing trusted members before gating categories.
   Only explicitly protected public categories with synced children are modified.
   Unprotect restores saved overwrites and replaces later manual overwrite changes.
6. Existing poll totals remain, but identities of votes cast before persistence was
   introduced cannot be reconstructed. Hosts manage retention of stored poll data.
7. Logging is enabled by default for existing configurations; use `/log-options`
   to disable categories. Deleted message text is only available if it was cached.
8. Retest giveaway creation/editing/pausing and a purge transcript in a private
   server after installing the patched dependency tree. The new compatibility
   tests replace Discord and database I/O and do not replace a live smoke test.

The release is prepared in PR #166. No release tag has been published.
