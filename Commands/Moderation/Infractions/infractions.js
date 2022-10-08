const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("infractions")
    .setDescription(
      "View User's Infraction Count Or Remove Their Infraction Count."
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options
        .setName("remove")
        .setDescription("Remove Infractions")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select The User.")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("Reason For Infraction Removal.")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("view")
        .setDescription("View Infractions ")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Select The User.")
            .setRequired(true)
        )
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
};
