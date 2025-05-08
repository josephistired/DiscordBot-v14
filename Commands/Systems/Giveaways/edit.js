const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/giveaway");
const { errorSend } = require("../../../Functions/errorlogSend");
const ms = require("ms");

module.exports = {
  subCommand: "giveaway.edit",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
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

      await client.giveawaysManager.edit(giveawayId, {
        addTime: ms(addTime),
        newWinnerCount,
        newPrize,
      });
      await interaction.reply("✅ Success! Giveaway edited!");
    } catch (error) {
      errorSend(
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
