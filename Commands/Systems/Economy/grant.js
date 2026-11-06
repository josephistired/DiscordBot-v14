const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const economy = require("../../../Functions/economy");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "economy.grant",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const successEmbed = new EmbedBuilder()
        .setTitle("🪙 Coins Granted")
        .setColor("Green")
        .setTimestamp();
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        throw new Error("Manage Server permission is required to grant coins.");
      }
      const user = options.getUser("user", true);
      const amount = options.getInteger("amount", true);
      if (user.bot) throw new Error("Choose a human member.");
      await interaction.guild.members.fetch(user.id);
      await economy.grant(interaction.guildId, user.id, amount);
      successEmbed.setDescription(`Granted ${amount} coins to ${user}.`);
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
          command: `economy.grant`,
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
