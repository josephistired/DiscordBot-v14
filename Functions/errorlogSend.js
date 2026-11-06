const { MessageFlags, EmbedBuilder } = require("discord.js");
async function errorSend({ user, command, time, error }, interaction) {
  const errorEmbed = new EmbedBuilder()
    .setTitle("🚫 Error Occured 🚫")
    .setAuthor({
      name: `${interaction.user.tag} | ${interaction.user.id}`,
      iconURL: interaction.user.displayAvatarURL(),
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
      },
    )
    .setFooter({ text: " 🚫 Error Ocurred" })
    .setTimestamp();

  const respond = interaction.replied
    ? "followUp"
    : interaction.deferred
      ? "editReply"
      : "reply";
  await interaction[respond]({
    embeds: [errorEmbed],
    ...(respond === "editReply" ? {} : { flags: MessageFlags.Ephemeral }),
  });
}

module.exports = { errorSend };
