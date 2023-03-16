const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("games")
    .setDescription("Play classic games with your friend.")
    .setDMPermission(false)
    .addSubcommand((options) =>
      options
        .setName("connect-four")
        .setDescription(
          "Play the classic Connect Four game with your friend through Discord!"
        )
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select the user")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("tic-tac-toe")
        .setDescription(
          "Play the classic Tic Tac Toe game with your friend through Discord!"
        )
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select the user")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("rock-paper-scissors")
        .setDescription(
          "Play the classic Rock Paper Scissors game with your friend through Discord!"
        )
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select the user")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("minesweeper")
        .setDescription("Play the classic Minesweeper game through Discord!")
    )
    .addSubcommand((options) =>
      options
        .setName("2048")
        .setDescription("Play the classic 2048 game through Discord!")
    ),
};
