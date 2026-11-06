const {
  MessageFlags,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../../Schemas/giveaway");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "giveaway.pause",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const giveawayId = interaction.options.getString("id");
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

      if (giveaway.pauseOptions.isPaused === true) {
        errors.push(
          `The giveaway with message ID ${giveawayId} discovered has already been paused.`,
        );
        throw new Error(errors.join("\n"));
      }

      await client.giveawaysManager.pause(giveawayId);
      await interaction.editReply("✅ Success! Giveaway paused!");
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
