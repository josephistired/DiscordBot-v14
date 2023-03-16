const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infractions")
    .setDMPermission(false)
    .setDescription(
      "View the infraction count of a user or reset their infraction count. "
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options
        .setName("reset")
        .setDescription("Reset infractions")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select the user")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("The reason for the removal of the infractions?")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("view")
        .setDescription("View infractions")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select The user")
            .setRequired(true)
        )
    ),
};
