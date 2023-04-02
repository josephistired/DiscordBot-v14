const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("A complete giveaway system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
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
    )
    .addSubcommand((options) =>
      options
        .setName("reroll")
        .setDescription("Reroll the giveaway")
        .addStringOption((options) =>
          options
            .setName("id")
            .setDescription("Provide the message ID of the giveaway")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("delete")
        .setDescription("Delete the giveaway")
        .addStringOption((options) =>
          options
            .setName("id")
            .setDescription("Provide the message ID of the giveaway")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("edit")
        .setDescription("Reroll the giveaway")
        .addStringOption((options) =>
          options
            .setName("id")
            .setDescription("Provide the message ID of the giveaway")
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
        .addStringOption((options) =>
          options
            .setName("duration")
            .setDescription("Provide the duration for the giveaway")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("end")
        .setDescription("End the giveaway")
        .addStringOption((options) =>
          options
            .setName("id")
            .setDescription("Provide the message ID of the giveaway")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("pause")
        .setDescription("Pause the giveaway")
        .addStringOption((options) =>
          options
            .setName("id")
            .setDescription("Provide the message ID of the giveaway")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("unpause")
        .setDescription("Unpause the giveaway")
        .addStringOption((options) =>
          options
            .setName("id")
            .setDescription("Provide the message ID of the giveaway")
            .setRequired(true)
        )
    ),
};
