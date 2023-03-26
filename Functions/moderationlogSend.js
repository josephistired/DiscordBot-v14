const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const logDatabase = require("../Schemas/logs");

async function moderationlogSend(
  {
    action,
    command,
    moderator,
    user,
    reason,
    emoji,
    place,
    messages,
    size,
    duration,
    total,
    transcript,
  },
  interaction
) {
  const data = await logDatabase.findOne({ Guild: interaction.guild.id });
  if (!data) return;

  const attachment = new AttachmentBuilder("assets/moderation.gif");

  const channel = interaction.guild.channels.cache.get(data.logChannel);
  const time = parseInt(interaction.createdTimestamp / 1000);

  const commandEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setColor("Green")
    .setThumbnail("attachment://moderation.gif")
    .setDescription(
      [
        `🤔 Action: ${action}`,
        `👤 User Punished: ${user || "Not applicable"}`,
        `🔘 Channel: ${place || "Not applicable"}`,
        `❔ Reason: ${reason || "Not applicable"}`,
        `📅 Days Of Messages Deleted: ${messages || "Not applicable"}`,
        `🔢 Total Messages Deleted: ${size || "Not applicable"}`,
        `🎟️ Infraction Total: ${total || "Not applicable"}`,
        `⏲️ Duration: ${duration || "Not applicable"}`,
        `⌚ Command Executed: <t:${time}:D> | <t:${time}:R>`,
        `👮🏻 Moderator: ${moderator || "Not applicable"}`,
      ].join("\n")
    )
    .setFooter({ text: `${action} Executed` })
    .setTimestamp();

  if (transcript)
    channel.send({
      embeds: [commandEmbed],
      files: [transcript, attachment],
    });
  else channel.send({ embeds: [commandEmbed], files: [attachment] });
}

module.exports = { moderationlogSend };
