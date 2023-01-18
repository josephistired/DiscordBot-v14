const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const manager = require("../../../src/index");

module.exports = {
  subCommand: "giveaway.start",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options } = interaction;

    const duration = options.getString("duration");
    const winnerCount = options.getInteger("winners");
    const prize = options.getString("prize");

    client.manager
      .start(interaction.channel, {
        duration: ms(duration),
        winnerCount,
        prize,
      })
      .then((data) => {
        console.log(data);
      });
  },
};
