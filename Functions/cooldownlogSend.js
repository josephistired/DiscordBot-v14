const { MessageFlags, EmbedBuilder } = require("discord.js");
async function cooldownSend({ user, command, time, left }, interaction) {
  const errorEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setDescription(
      `⚠️ Alert: Please wait ${left} Seconds before running this command again.`,
    )
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
        name: "⏲️ Command Executed:",
        value: `<t:${time}:D> | <t:${time}:R>`,
      },
    )
    .setFooter({ text: "⏱️ Cooldown Alert" })
    .setTimestamp();

  await interaction.reply({
    embeds: [errorEmbed],
    flags: MessageFlags.Ephemeral,
  });
}

module.exports = { cooldownSend };
