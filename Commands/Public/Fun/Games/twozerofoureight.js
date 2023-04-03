const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const { TwoZeroFourEight } = require("discord-gamecord");

module.exports = {
  subCommand: "games.2048",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const Game = new TwoZeroFourEight({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "2048",
        color: "#5865F2",
      },
      emojis: {
        up: "⬆️",
        down: "⬇️",
        left: "⬅️",
        right: "➡️",
      },
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    await Game.startGame();
  },
};
