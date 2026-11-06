const {
  MessageFlags,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../../Schemas/giveaway");
const { errorSend } = require("../../../Functions/errorlogSend");
const ms = require("ms");

module.exports = {
  subCommand: "giveaway.edit",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const { options } = interaction;
      const giveawayId = interaction.options.getString("id");
      const newWinnerCount = options.getInteger("winners");
      const newPrize = options.getString("prize");
      const addTime = options.getString("duration");

      const errors = [];

      const giveaway = await Database.findOne({
        guildId: interaction.guildId,
        messageId: giveawayId,
      });

      if (!giveaway) {
        errors.push(
          `No giveaways found with the provided message ID: ${giveawayId}`,
        );
        throw new Error(errors.join("\n"));
      }

      const duration = ms(addTime);
      if (!Number.isFinite(duration) || duration <= 0 || newWinnerCount < 1) {
        throw new Error("Provide a positive duration and at least one winner.");
      }
      await client.giveawaysManager.edit(giveawayId, {
        addTime: duration,
        newWinnerCount,
        newPrize,
      });
      await interaction.editReply("✅ Success! Giveaway edited!");
    } catch (error) {
      await errorSend(
        {
          user: `${interaction.user.username}`,
          command: `${interaction.commandName}`,
          error: error.message,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction,
      );
    }
  },
};
