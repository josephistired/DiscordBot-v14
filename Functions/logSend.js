const { EmbedBuilder } = require("discord.js");

const logModel = require("../Schemas/logs");

async function logSend(
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

  const channel = interaction.guild.channels.cache.get(data.Channel);
  const logsEmbed = new EmbedBuilder()
    .setAuthor({ name: `${emoji} ${action} Command Executed!` })
    .setColor("Green")
    .setImage(
      "https://toppng.com/uploads/preview/engagement-punchh-com-mod-pizza-logo-vector-11562898893i77wtdx1h8.png"
    )
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
        value: `\`\`\`${reason}\`\`\``,
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
        value: `\`\`\`${moderator}\`\`\``,
      }
    );
  if (transcript) channel.send({ embeds: [logsEmbed], files: [transcript] });
  else channel.send({ embeds: [logsEmbed] });
}

module.exports = { logSend };
