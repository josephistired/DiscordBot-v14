const { EmbedBuilder } = require("discord.js");

const logDatabase = require("../Schemas/logs");

async function commandlogSend({ time, place, command }, interaction) {
  try {
    const data = await logDatabase.findOne({ Guild: interaction?.guild?.id });
    if (!data || !require("./guildLog").enabled(data, "commands")) return;

    const channel = interaction.guild.channels.cache.get(data.logChannel);

    if (!channel?.isTextBased()) return;

    const commandEmbed = new EmbedBuilder()
      .setTitle("💬 Command Log 💬")
      .setAuthor({
        name: `${interaction.user.tag} | ${interaction.user.id}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor("Green")

      .addFields(
        {
          name: "👤 User:",
          value: `${interaction.user}`,
        },
        {
          name: "💬 Command:",
          value: `${command}`,
        },
        {
          name: "❔ Channel:",
          value: `  ${place}`,
        },
        {
          name: "⏲️ Command Executed:",
          value: `<t:${time}:D> | <t:${time}:R>`,
        },
      )
      .setFooter({ text: "📩 Command Executed" })
      .setTimestamp();

    await channel.send({ embeds: [commandEmbed] });
  } catch (error) {
    console.error(error);
  }
}

module.exports = { commandlogSend };
