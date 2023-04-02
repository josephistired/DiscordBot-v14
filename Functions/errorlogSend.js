const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

async function errorSend({ user, command, time, error }, interaction) {
  const attachment = new AttachmentBuilder("assets/error.png");

  const errorEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setColor("Red")
    .setThumbnail("attachment://error.png")
    .setDescription(
      [
        `👤 User: ${user}`,
        `💬 Command: ${command}`,
        `🛑 Error: ${error}`,
        `⏲️ Command Executed: <t:${time}:D> | <t:${time}:R>`,
      ].join("\n")
    )
    .setFooter({ text: "Error Ocurred" })
    .setTimestamp();

  interaction.reply({
    embeds: [errorEmbed],
    files: [attachment],
    ephemeral: true,
  });
}

module.exports = { errorSend };
