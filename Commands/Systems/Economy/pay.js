const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const economy = require("../../../Functions/economy");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "economy.pay",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const successEmbed = new EmbedBuilder()
        .setTitle("💸 Payment Complete")
        .setColor("Green")
        .setTimestamp();
      const user = options.getUser("user", true);
      const amount = options.getInteger("amount", true);
      if (user.bot) throw new Error("Choose a human member.");
      await interaction.guild.members.fetch(user.id);
      await economy.pay(
        interaction.guildId,
        interaction.user.id,
        user.id,
        amount,
      );
      successEmbed.setDescription(`Paid ${amount} coins to ${user}.`);
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
          command: `economy.pay`,
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
