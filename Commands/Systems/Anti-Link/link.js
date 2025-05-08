const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("A link detection system")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options
        .setName("options")
        .setDescription("Options for the Anti-Link system")
        .addStringOption((options) =>
          options
            .setName("discord-links")
            .setDescription(
              "The system to delete all discord server invite links.",
            )
            .setRequired(true)
            .addChoices(
              {
                name: "Enable",
                value: "true",
              },
              {
                name: "Disable",
                value: "false",
              },
            ),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("reset")
        .setDescription("Reset Discord Invite count for a user.")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select the user")
            .setRequired(true),
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("The reason for the removal of the count?")
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("count")
        .setDescription("View Discord Invite count")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select The user")
            .setRequired(true),
        ),
    ),
};
