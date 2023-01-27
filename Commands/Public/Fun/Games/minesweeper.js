const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const { Minesweeper } = require("discord-gamecord");

module.exports = {
  subCommand: "games.minesweeper",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const Game = new Minesweeper({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Minesweeper",
        color: "#5865F2",
        description: "Click on the buttons to reveal the blocks except mines.",
      },
      emojis: { flag: "🚩", mine: "💣" },
      mines: 5,
      timeoutTime: 60000,
      winMessage:
        "You have won the game. All mines were successfully avoided by you. ",
      loseMessage: "You failed the game. Next time, be cautious of the mines.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
  },
};
