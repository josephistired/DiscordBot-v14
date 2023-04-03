const { ChatInputCommandInteraction } = require("discord.js");
const ms = require("ms");

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

    await client.giveawaysManager.start(interaction.channel, {
      duration: ms(duration),
      winnerCount,
      prize,
      hostedBy: interaction.user.username,
      thumbnail: interaction.user.displayAvatarURL(),
    });
  },
};
