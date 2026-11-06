const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verification")
    .setDescription("Configure role-based server verification")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((options) =>
      options
        .setName("setup")
        .setDescription("Publish a verification button in a public lobby")
        .addChannelOption((options) =>
          options
            .setName("channel")
            .setDescription("Public verification lobby")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption((options) =>
          options
            .setName("role")
            .setDescription("Low-privilege verified member role")
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("protect")
        .setDescription("Gate a public category behind the verified role")
        .addChannelOption((options) =>
          options
            .setName("category")
            .setDescription("Public category to protect")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory),
        )
        .addBooleanOption((options) =>
          options
            .setName("confirm")
            .setDescription(
              "Apply permission changes to this category and synced children",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("unprotect")
        .setDescription("Restore a protected category's saved permissions")
        .addChannelOption((options) =>
          options
            .setName("category")
            .setDescription("Protected category")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory),
        )
        .addBooleanOption((options) =>
          options
            .setName("confirm")
            .setDescription(
              "Restore saved overwrites, replacing current category overwrites",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("status")
        .setDescription("Show current verification setup"),
    ),
};
