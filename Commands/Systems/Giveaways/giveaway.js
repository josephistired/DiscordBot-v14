const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("A complete giveaway system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options
        .setName("start")
        .setDescription("Start the giveaway")
        .addStringOption((options) =>
          options
            .setName("duration")
            .setDescription("Provide the duration for the giveaway")
            .setRequired(true)
        )
        .addIntegerOption((options) =>
          options
            .setName("winners")
            .setDescription("Provide the number of winners for the giveaway")
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("prize")
            .setDescription("Provide the prize for the giveaway")
            .setRequired(true)
        )
    ),
};
