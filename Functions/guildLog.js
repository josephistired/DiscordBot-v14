const { EmbedBuilder } = require("discord.js");
const { connection } = require("mongoose");
const Config = require("../Schemas/logs");
const CATEGORIES = [
  "commands",
  "moderation",
  "members",
  "messages",
  "channels",
  "roles",
  "bans",
  "voice",
  "server",
  "invites",
  "emojis",
];
const LOG_EMOJIS = {
  commands: "💬",
  moderation: "🚨",
  members: "👥",
  messages: "📝",
  channels: "📺",
  roles: "🏷️",
  bans: "🔨",
  voice: "🎙️",
  server: "⚙️",
  invites: "🔗",
  emojis: "😀",
};
function enabled(config, category) {
  const value =
    typeof config.events?.get === "function"
      ? config.events.get(category)
      : config.events?.[category];
  return value !== false;
}
async function getLogChannel(guild, category) {
  if (!guild || connection.readyState !== 1) return null;
  const config = await Config.findOne({ Guild: guild.id });
  if (!config || !enabled(config, category)) return null;
  const channel = guild.channels.cache.get(config.logChannel);
  return channel?.isSendable() ? channel : null;
}
async function guildLog(guild, category, title, description, sourceChannelId) {
  try {
    const channel = await getLogChannel(guild, category);
    // Never recursively log this bot's log-channel messages.
    if (!channel || channel.id === sourceChannelId) return;
    const emoji = LOG_EMOJIS[category] ?? "📋";
    const time = Math.floor(Date.now() / 1000);
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle(`${emoji} ${title} ${emoji}`.slice(0, 256))
          .setDescription(
            String(description || "Details unavailable").slice(0, 4096),
          )
          .addFields(
            {
              name: "🏠 Server:",
              value: String(guild.name ?? guild.id).slice(0, 1024),
              inline: true,
            },
            {
              name: "⏲️ Event Recorded:",
              value: `<t:${time}:F> | <t:${time}:R>`,
              inline: true,
            },
          )
          .setFooter({ text: `${emoji} Server Event Logged` })
          .setTimestamp(),
      ],
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    console.error(`Unable to log ${category}:`, error);
  }
}
module.exports = { CATEGORIES, enabled, getLogChannel, guildLog };
