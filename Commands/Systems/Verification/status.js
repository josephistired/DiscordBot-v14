const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Database = require("../../../Schemas/verification");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "verification.status",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const config = await Database.findOne({ Guild: interaction.guildId });
      const successEmbed = new EmbedBuilder()
        .setTitle("🔐 Verification Status")
        .setColor("Green")
        .setTimestamp();
      if (config) {
        successEmbed
          .setDescription(
            "Only categories explicitly protected by an admin are gated.",
          )
          .addFields(
            { name: "Lobby:", value: `<#${config.channel}>`, inline: true },
            {
              name: "Verified Role:",
              value: `<@&${config.role}>`,
              inline: true,
            },
          );
      } else successEmbed.setDescription("Verification is not configured.");
      await interaction.editReply({
        embeds: [successEmbed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      await errorSend(
        {
          user: interaction.user.username,
          command: "verification.status",
          error: error.message,
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
