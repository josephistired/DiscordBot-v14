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
              "The system to delete all discord server invite links."
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
              }
            )
        )
    ),
};
