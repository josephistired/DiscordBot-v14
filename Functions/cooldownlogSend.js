const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

async function cooldownSend({ user, command, time, left }, interaction) {
  const attachment = new AttachmentBuilder("assets/cooldown.jpg");

  const errorEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setColor("Red")
    .setThumbnail("attachment://cooldown.jpg")
    .setDescription(
      [
        `⚠️ Alert: Please wait before running this command again`,
        `⏱️ Time Left: ${left} Seconds`,
        `👤 User: ${user}`,
        `💬 Command: ${command}`,
        `⏲️ Command Executed: <t:${time}:D> | <t:${time}:R>`,
      ].join("\n")
    )
    .setFooter({ text: "Cooldown Alert" })
    .setTimestamp();

  await interaction.reply({
    embeds: [errorEmbed],
    files: [attachment],
    ephemeral: true,
  });
}

module.exports = { cooldownSend };
