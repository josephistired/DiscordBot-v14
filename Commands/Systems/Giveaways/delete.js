const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/giveaway");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "giveaway.delete",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
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

      await client.giveawaysManager.delete(giveawayId);
      await interaction.reply("✅ Success! Giveaway deleted!");
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
