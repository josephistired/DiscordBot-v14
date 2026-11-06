const { EmbedBuilder } = require("discord.js");

async function errorSend({ user, command, time, error }, interaction) {

  const errorEmbed = new EmbedBuilder()
    .setTitle("🚫 Error Occured 🚫")
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setColor("Red")

    .addFields(
      {
        name: "👤 User:",
        value: `${user}`,
      },
      {
        name: "💬 Command:",
        value: `${command}`,
      },
      {
        name: "🛑 Error:",
        value: String(error).slice(0, 1024) || "Unknown error",
      },
      {
        name: "⏲️ Command Executed:",
        value: `<t:${time}:D> | <t:${time}:R>`,
      }
    )
    .setFooter({ text: " 🚫 Error Ocurred" })
    .setTimestamp();

  const respond = interaction.deferred || interaction.replied ? "followUp" : "reply";
  await interaction[respond]({
    embeds: [errorEmbed],
    ephemeral: true,
  });
}

module.exports = { errorSend };
