const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

const logModel = require("../Schemas/logs");

async function commandlogSend(
  { user, time, place, command, emoji },
  interaction
) {
  const data = await logModel.findOne({ Guild: interaction.guild.id });
  if (!data) return;

  const attachment = new AttachmentBuilder("assets/warning.png");

  const channel = interaction.guild.channels.cache.get(data.Channel);
  const logsEmbed = new EmbedBuilder()
    .setAuthor({ name: `${emoji} ${command} Command Executed!` })
    .setColor("Green")
    .setImage("attachment://warning.png")
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
        name: "🕰️ Time:",
        value: `\`\`\`${time || "Not applicable"}\`\`\``,
      }
    );
  channel.send({ embeds: [logsEmbed], files: [attachment] });
}

module.exports = { commandlogSend };
