const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const logModel = require("../Schemas/logs");

async function moderationlogSend(
  {
    action,
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
  const data = await logModel.findOne({ Guild: interaction.guild.id });
  if (!data) return;

  const attachment = new AttachmentBuilder("assets/moderation.gif");

  const channel = interaction.guild.channels.cache.get(data.Channel);
  const logsEmbed = new EmbedBuilder()
    .setAuthor({ name: `${emoji} ${action} Executed!` })
    .setColor("Green")
    .setImage("attachment://moderation.gif")
    .setTimestamp()
    .addFields(
      {
        name: "👤 User:",
        value: `\`\`\`${user || "Not applicable"}\`\`\``,
      },
      {
        name: "🔘 Channel:",
        value: `\`\`\`${place || "Not applicable"}\`\`\``,
      },
      {
        name: "❔ Reason:",
        value: `\`\`\`${reason || "Not applicable"} \`\`\``,
      },
      {
        name: "📅 Days Of Messages Deleted:",
        value: `\`\`\`${messages || "Not applicable"}\`\`\``,
      },
      {
        name: "🔢 Total messages:",
        value: `\`\`\`${size || "Not applicable"}\`\`\``,
      },
      {
        name: "🎟️ Infraction total:",
        value: `\`\`\`${total || "Not applicable"}\`\`\``,
      },
      {
        name: "⌚ Duration:",
        value: `\`\`\`${duration || "Not applicable"}\`\`\``,
      },
      {
        name: "👮🏻 Moderator:",
        value: `\`\`\`${moderator || "Not applicable"}\`\`\``,
      }
    );
  if (transcript)
    channel.send({
      embeds: [logsEmbed],
      files: [transcript, attachment],
    });
  else channel.send({ embeds: [logsEmbed], files: [attachment] });
}

module.exports = { moderationlogSend };
