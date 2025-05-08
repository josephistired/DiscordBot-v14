const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

async function cooldownSend({ user, command, time, left }, interaction) {
  const attachment = new AttachmentBuilder("assets/cooldown.jpg");

  const errorEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setDescription(
      `⚠️ Alert: Please wait ${left} Seconds before running this command again.`,
    )
    .setColor("Red")
    .setThumbnail("attachment://cooldown.jpg")
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
        name: "⏲️ Command Executed:",
        value: `<t:${time}:D> | <t:${time}:R>`,
      },
    )
    .setFooter({ text: "⏱️ Cooldown Alert" })
    .setTimestamp();

  await interaction.reply({
    embeds: [errorEmbed],
    files: [attachment],
    ephemeral: true,
  });
}

module.exports = { cooldownSend };
