const { EmbedBuilder } = require("discord.js");
const logDatabase = require("../Schemas/logs");

async function moderationlogSend(
  {
    action,
    moderator,
    user,
    reason,
    place,
    messages,
    size,
    duration,
    total,
    transcript,
    link,
  },
  interaction,
  message,
) {
  const source = interaction ?? message;
  const guild = source?.guild;
  if (!guild) return;
  const data = await logDatabase.findOne({ Guild: guild.id });

  if (!data || !require("./guildLog").enabled(data, "moderation")) return;

  const channel = guild.channels.cache.get(data.logChannel);
  if (!channel?.isTextBased()) return;

  const time = parseInt(source.createdTimestamp / 1000, 10);

  const commandEmbed = new EmbedBuilder()
    .setTitle("🚨 Moderation Log 🚨")
    .setAuthor({
      name: `${(source.user ?? source.author).tag} | ${(source.user ?? source.author).id}`,
      iconURL: (source.user ?? source.author).displayAvatarURL(),
    })
    .setColor("Green")

    .addFields(
      {
        name: "🤔 Action",
        value: action,
      },
      {
        name: "👤 User Punished",
        value: user || "Not applicable",
      },
      {
        name: "🔘 Channel",
        value: place || "Not applicable",
      },
      {
        name: "❔ Reason",
        value: reason || "Not applicable",
      },
      {
        name: "🔗 Link Deleted",
        value: link || "Not applicable",
      },
      {
        name: "📅 Days Of Messages Deleted",
        value: messages || "Not applicable",
      },
      {
        name: "🔢 Total Messages Deleted",
        value: size || "Not applicable",
      },
      {
        name: "🎟️ Infraction Total",
        value: total || "Not applicable",
      },
      {
        name: "⏲️ Duration",
        value: duration || "Not applicable",
      },
      {
        name: "⌚ Command Executed",
        value: `<t:${time}:D> | <t:${time}:R>`,
      },
      {
        name: "👮🏻 Moderator",
        value: moderator || "Not applicable",
      },
    )
    .setFooter({ text: `${action} Executed` })
    .setTimestamp();

  if (transcript)
    await channel.send({
      embeds: [commandEmbed],
      files: [transcript],
    });
  else await channel.send({ embeds: [commandEmbed] });
}

module.exports = { moderationlogSend };
