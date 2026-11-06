const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const { RockPaperScissors } = require("discord-gamecord");

module.exports = {
  subCommand: "games.rock-paper-scissors",
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

    const Game = new RockPaperScissors({
      message: interaction,
      isSlashGame: true,
      opponent: user,
      embed: {
        title: "Rock Paper Scissors",
        rejectTitle: "Cancelled Request",
        statusTitle: "Status",
        overTitle: "Game Over",
        color: "#00FF00",
        rejectColor: "#ED4245",
      },
      buttons: {
        rock: "Rock",
        paper: "Paper",
        scissors: "Scissors",
      },
      emojis: {
        rock: "🌑",
        paper: "📰",
        scissors: "✂️",
      },
      mentionUser: true,
      timeoutTime: 50000,
      buttonStyle: "PRIMARY",
      pickMessage: "You choose {emoji}.",
      winMessage: " 🎊 | **{player}** has won the Rock Paper Scissors Game!",
      tieMessage: "Game tied! The Game has no winner!",
      timeoutMessage: "The Game wasn't completed! The Game has no winner! ",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons!",
    });

    await Game.startGame();
  },
};
