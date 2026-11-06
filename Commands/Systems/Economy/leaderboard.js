const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Account = require("../../../Schemas/economy");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "economy.leaderboard",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const successEmbed = new EmbedBuilder()
        .setTitle("🏆 Server Leaderboard")
        .setColor("Green")
        .setTimestamp();
      const accounts = await Account.aggregate([
        { $match: { Guild: interaction.guildId } },
        { $project: { User: 1, total: { $add: ["$wallet", "$bank"] } } },
        { $sort: { total: -1, User: 1 } },
        { $limit: 10 },
      ]);
      successEmbed.setDescription(
        accounts
          .map(
            (account, index) =>
              `${index + 1}. <@${account.User}>: ${account.total} coins`,
          )
          .join("\n") || "No accounts yet.",
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
          command: `economy.leaderboard`,
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
