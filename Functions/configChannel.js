const { PermissionFlagsBits } = require("discord.js");
async function validateConfigChannel(interaction, channel) {
  if (
    !channel ||
    channel.guildId !== interaction.guildId ||
    !channel.isTextBased() ||
    typeof channel.send !== "function"
  ) {
    throw new Error("Choose a text or announcement channel in this server.");
  }
  const me =
    interaction.guild.members.me ?? (await interaction.guild.members.fetchMe());
  const permissions = channel.permissionsFor(me);
  if (
    !permissions?.has([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
    ])
  ) {
    throw new Error(
      "The bot needs View Channel, Send Messages, and Embed Links in that channel.",
    );
  }
  return me;
}
module.exports = { validateConfigChannel };
