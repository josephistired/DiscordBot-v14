const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const economy = require("../../../Functions/economy");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "economy.buy",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const successEmbed = new EmbedBuilder()
        .setTitle("🛍️ Purchase Complete")
        .setColor("Green")
        .setTimestamp();
      const item = await economy.buy(
        interaction.guildId,
        interaction.user.id,
        options.getString("item", true),
      );
      successEmbed.setDescription(
        `Purchased ${item.name} for ${item.price} coins.`,
      );
      await interaction.editReply({
        embeds: [successEmbed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      const known =
        /Amount|cannot pay|Reward unavailable|Insufficient|limit|enough coins|permission|human member/i.test(
          error.message,
        );
      if (!known) console.error("Economy operation failed:", error);
      await errorSend(
        {
          user: interaction.user.username,
          command: `economy.buy`,
          error: known
            ? error.message
            : "Economy operation failed. Transfers require MongoDB Atlas or a replica set with transaction support.",
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
