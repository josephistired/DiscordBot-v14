const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cooldown")
    .setDescription("Control the cooldown system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((options) =>
      options
        .setName("moderation")
        .setDescription(
          "This allows you set the cooldown for all moderation commands."
        )
        .addStringOption((options) =>
          options
            .setName("time")
            .setDescription("Select the cooldown time.")
            .setChoices(
              {
                name: "five seconds",
                value: "5000",
              },
              {
                name: "ten seconds",
                value: "10000",
              },
              {
                name: "twenty seconds",
                value: "20000",
              },
              {
                name: "thirty seconds",
                value: "30000",
              },
              {
                name: "sixty seconds",
                value: "60000",
              }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("fun")
        .setDescription(
          "This allows you set the cooldown for all moderation commands."
        )
        .addStringOption((options) =>
          options
            .setName("time")
            .setDescription("Select the cooldown time.")
            .setChoices(
              {
                name: "five seconds",
                value: "5000",
              },
              {
                name: "ten seconds",
                value: "10000",
              },
              {
                name: "twenty seconds",
                value: "20000",
              },
              {
                name: "thirty seconds",
                value: "30000",
              },
              {
                name: "sixty seconds",
                value: "60000",
              }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName("utilities")
        .setDescription(
          "This allows you set the cooldown for all moderation commands."
        )
        .addStringOption((options) =>
          options
            .setName("time")
            .setDescription("Select the cooldown time.")
            .setChoices(
              {
                name: "five seconds",
                value: "5000",
              },
              {
                name: "ten seconds",
                value: "10000",
              },
              {
                name: "twenty seconds",
                value: "20000",
              },
              {
                name: "thirty seconds",
                value: "30000",
              },
              {
                name: "sixty seconds",
                value: "60000",
              }
            )
            .setRequired(true)
        )
    ),
};
