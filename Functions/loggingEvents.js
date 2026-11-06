const { Events } = require("discord.js");
const { guildLog } = require("./guildLog");
const show = (value) => String(value ?? "Unavailable").slice(0, 1200);
const user = (value) => value?.tag ?? value?.id ?? "Unknown user";
const roleState = (r) =>
  `${r.name} | color ${r.hexColor} | permissions ${r.permissions.bitfield} | position ${r.position}`;
const channelState = (c) =>
  `${c.name} | type ${c.type} | category ${c.parentId ?? "none"} | topic ${c.topic ?? "none"}`;
const definitions = [
  [
    Events.GuildMemberAdd,
    "members",
    "Member joined",
    (m) => [m.guild, `👤 User: ${user(m.user)} (${m.id})`],
  ],
  [
    Events.GuildMemberRemove,
    "members",
    "Member left",
    (m) => [m.guild, `👤 User: ${user(m.user)} (${m.id})`],
  ],
  [
    Events.GuildMemberUpdate,
    "members",
    "Member updated",
    (a, b) => {
      const before = `${a.nickname ?? a.user.username} | roles ${[...a.roles.cache.keys()].sort().join(",")} | timeout ${a.communicationDisabledUntilTimestamp ?? "none"}`;
      const after = `${b.nickname ?? b.user.username} | roles ${[...b.roles.cache.keys()].sort().join(",")} | timeout ${b.communicationDisabledUntilTimestamp ?? "none"}`;
      return before === after
        ? null
        : [
            b.guild,
            `${user(b.user)} (${b.id})\n⬅️ Before: ${show(before)}\n➡️ After: ${show(after)}`,
          ];
    },
  ],
  [
    Events.MessageDelete,
    "messages",
    "Message deleted",
    (m) =>
      m.author?.bot
        ? null
        : [
            m.guild,
            `👤 Author: ${user(m.author)}\n💬 Channel: <#${m.channelId}>\n🆔 Message: ${m.id}\n${show(m.content || "Content was not cached")}`,
            m.channelId,
          ],
  ],
  [
    Events.MessageBulkDelete,
    "messages",
    "Messages bulk deleted",
    (messages, channel) => [
      channel.guild,
      `${messages.size} messages deleted in <#${channel.id}>.`,
      channel.id,
    ],
  ],
  [
    Events.MessageUpdate,
    "messages",
    "Message edited",
    (a, b) =>
      b.author?.bot || a.content === b.content
        ? null
        : [
            b.guild,
            `👤 Author: ${user(b.author)}\n💬 Channel: <#${b.channelId}>\n⬅️ Before: ${show(a.content)}\n➡️ After: ${show(b.content)}`,
            b.channelId,
          ],
  ],
  [
    Events.ChannelCreate,
    "channels",
    "Channel created",
    (c) => [c.guild, `${channelState(c)} (${c.id})`],
  ],
  [
    Events.ChannelDelete,
    "channels",
    "Channel deleted",
    (c) => [c.guild, `${channelState(c)} (${c.id})`],
  ],
  [
    Events.ChannelUpdate,
    "channels",
    "Channel updated",
    (a, b) => {
      const overwrites = (c) =>
        [...(c.permissionOverwrites?.cache.values() ?? [])]
          .map((o) => `${o.id}:${o.allow.bitfield}:${o.deny.bitfield}`)
          .sort()
          .join("|");
      if (
        channelState(a) === channelState(b) &&
        overwrites(a) === overwrites(b)
      )
        return null;
      return [
        b.guild,
        `⬅️ Before: ${show(channelState(a))}\n➡️ After: ${show(channelState(b))}\n🔐 Permission overwrites ${overwrites(a) === overwrites(b) ? "unchanged" : "changed"}`,
      ];
    },
  ],
  [
    Events.GuildRoleCreate,
    "roles",
    "Role created",
    (r) => [r.guild, `${roleState(r)} (${r.id})`],
  ],
  [
    Events.GuildRoleDelete,
    "roles",
    "Role deleted",
    (r) => [r.guild, `${roleState(r)} (${r.id})`],
  ],
  [
    Events.GuildRoleUpdate,
    "roles",
    "Role updated",
    (a, b) =>
      roleState(a) === roleState(b)
        ? null
        : [
            b.guild,
            `⬅️ Before: ${show(roleState(a))}\n➡️ After: ${show(roleState(b))}`,
          ],
  ],
  [
    Events.GuildBanAdd,
    "bans",
    "Member banned",
    (b) => [
      b.guild,
      `👤 User: ${user(b.user)} (${b.user.id})\n❔ Reason: ${show(b.reason)}`,
    ],
  ],
  [
    Events.GuildBanRemove,
    "bans",
    "Member unbanned",
    (b) => [b.guild, `👤 User: ${user(b.user)} (${b.user.id})`],
  ],
  [
    Events.VoiceStateUpdate,
    "voice",
    "Voice state changed",
    (a, b) =>
      a.channelId === b.channelId &&
      a.serverMute === b.serverMute &&
      a.serverDeaf === b.serverDeaf
        ? null
        : [
            b.guild,
            `${user(b.member?.user)} (${b.id})\n💬 Channel: ${a.channelId ?? "none"} → ${b.channelId ?? "none"}\n🔇 Server muted: ${Boolean(b.serverMute)} | 🔈 Server deafened: ${Boolean(b.serverDeaf)}`,
          ],
  ],
  [
    Events.GuildUpdate,
    "server",
    "Server updated",
    (a, b) =>
      a.name === b.name && a.verificationLevel === b.verificationLevel
        ? null
        : [
            b,
            `🏷️ Name: ${a.name} → ${b.name}\n🔐 Verification level: ${a.verificationLevel} → ${b.verificationLevel}`,
          ],
  ],
  [
    Events.InviteCreate,
    "invites",
    "Invite created",
    (i) => [
      i.guild,
      `🔗 Code: ${i.code}\n💬 Channel: <#${i.channelId}>\n👤 Inviter: ${user(i.inviter)}`,
    ],
  ],
  [
    Events.InviteDelete,
    "invites",
    "Invite deleted",
    (i) => [i.guild, `🔗 Code: ${i.code}`],
  ],
  [
    Events.GuildEmojiCreate,
    "emojis",
    "Emoji created",
    (e) => [e.guild, `${e.name} (${e.id})`],
  ],
  [
    Events.GuildEmojiDelete,
    "emojis",
    "Emoji deleted",
    (e) => [e.guild, `${e.name} (${e.id})`],
  ],
  [
    Events.GuildEmojiUpdate,
    "emojis",
    "Emoji updated",
    (a, b) =>
      a.name === b.name ? null : [b.guild, `${a.name} → ${b.name} (${b.id})`],
  ],
];
module.exports = {
  definitions,
  createLoggingEvent(name) {
    const definition = definitions.find((d) => d[0] === name);
    if (!definition) throw new Error(`Unknown logging event ${name}`);
    return {
      name,
      async execute(...args) {
        const result = definition[3](...args);
        if (result?.[0])
          await guildLog(
            result[0],
            definition[1],
            definition[2],
            result[1],
            result[2],
          );
      },
    };
  },
};
