const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const { Connect4 } = require("discord-gamecord");

module.exports = {
  subCommand: "games.connect-four",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    if (user.bot || user.id === interaction.user.id) {
      return interaction.reply({
        content: "Choose another human player.",
        flags: require("discord.js").MessageFlags.Ephemeral,
      });
    }

    const Game = new Connect4({
      message: interaction,
      isSlashGame: true,
      opponent: user,
      embed: {
        title: "Connect Four Game",
        rejectTitle: "Cancelled Request",
        statusTitle: "Status",
        overTitle: "Game Over",
        color: "#00FF00",
        rejectColor: "#ED4245",
      },
      emojis: {
        board: "⚪",
        player1: "🔴",
        player2: "🟡",
      },
      mentionUser: true,
      timeoutTime: 50000,
      buttonStyle: "PRIMARY",
      turnMessage: "{emoji} | Its the turn of player **{player}**!",
      winMessage: "{emoji} | **{player}** has won the Connect Four Game!",
      tieMessage: "Game tied! The game has no winner!",
      timeoutMessage: "The Game wasn't completed! The Game has no winner! ",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons!",
      rejectMessage:
        "{opponent} denied your request for a round of Connect Four {player}!",
    });

    await Game.startGame();
  },
};
