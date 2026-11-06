const { Events, MessageFlags, EmbedBuilder } = require("discord.js");
const { verifyMember } = require("../../Functions/verification");
const { errorSend } = require("../../Functions/errorlogSend");
module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (
      !interaction.isButton() ||
      interaction.customId !== "verification:verify"
    )
      return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const description = await verifyMember(interaction);
      const successEmbed = new EmbedBuilder()
        .setTitle("✅ Server Verification")
        .setDescription(description)
        .setColor("Green")
        .setTimestamp();
      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Verification failed:", error);
      await errorSend(
        {
          user: interaction.user.username,
          command: "Server Verification",
          error:
            "Verification is unavailable or this panel is inactive. Ask a server moderator to check the setup.",
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
