const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

async function errorSend({ user, command, time, error }, interaction) {
  const attachment = new AttachmentBuilder("assets/error.png");

  const errorEmbed = new EmbedBuilder()
    .setTitle("🚫 Error Occured 🚫")
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setColor("Red")
    .setThumbnail("attachment://error.png")
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
        value: ` ${error}`,
      },
      {
        name: "⏲️ Command Executed:",
        value: `<t:${time}:D> | <t:${time}:R>`,
      }
    )
    .setFooter({ text: " 🚫 Error Ocurred" })
    .setTimestamp();

  await interaction.reply({
    embeds: [errorEmbed],
    files: [attachment],
    ephemeral: true,
  });
}

module.exports = { errorSend };
