const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setContexts(InteractionContextType.Guild)
    .setDescription("Reload Your Commands Or Events.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName("events").setDescription("Reload Events."),
    )
    .addSubcommand((options) =>
      options.setName("commands").setDescription("Reload Commands."),
    ),
};
