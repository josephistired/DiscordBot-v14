const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const economy = require("../../../Functions/economy");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "economy.balance",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const successEmbed = new EmbedBuilder()
        .setTitle("🪙 Account Balance")
        .setColor("Green")
        .setTimestamp();
      const user = options.getUser("user") ?? interaction.user;
      const account = await economy.account(interaction.guildId, user.id);
      successEmbed
        .setDescription(`Balances for ${user}.`)
        .addFields(
          { name: "Wallet:", value: `${account.wallet} coins`, inline: true },
          { name: "Bank:", value: `${account.bank} coins`, inline: true },
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
          command: `economy.balance`,
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
