const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Control the welcome system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((options) =>
      options
        .setName("setup")
        .setDescription(
          "This allows you to setup your welcome system in your server."
        )
        .addChannelOption((options) =>
          options
            .setName("welcome-channel")
            .setDescription("Select the channel.")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("welcome-message")
            .setDescription("Provide a custom welcome message.")
        )
        .addStringOption((options) =>
          options
            .setName("welcome-color")
            .setDescription("Select the color of the welcome embed.")
            .setChoices(
              {
                name: "red",
                value: "Red",
              },
              {
                name: "green",
                value: "Green",
              },
              {
                name: "purple",
                value: "Purple",
              },
              {
                name: "blue",
                value: "Blue",
              },
              {
                name: "white",
                value: "White",
              }
            )
        )
    ),
};
