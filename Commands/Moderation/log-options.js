const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const Database = require("../../Schemas/logs");
const { errorSend } = require("../../Functions/errorlogSend");
const { CATEGORIES } = require("../../Functions/guildLog");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("log-options")
    .setDescription("Enable or disable a category of server logs")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((options) =>
      options
        .setName("event")
        .setDescription("Log category")
        .setRequired(true)
        .addChoices(
          ...["all", ...CATEGORIES].map((value) => ({ name: value, value })),
        ),
    )
    .addBooleanOption((options) =>
      options
        .setName("enabled")
        .setDescription("Enable this log category")
        .setRequired(true),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const event = options.getString("event", true);
      const enabled = options.getBoolean("enabled", true);
      const categories = event === "all" ? CATEGORIES : [event];
      if (categories.some((category) => !CATEGORIES.includes(category)))
        throw new Error("Unknown logging category.");
      const update = Object.fromEntries(
        categories.map((category) => [`events.${category}`, enabled]),
      );
      const config = await Database.findOneAndUpdate(
        { Guild: interaction.guildId },
        { $set: update },
        { new: true },
      );
      if (!config)
        throw new Error("Set a logging channel with /log-set first.");
      const successEmbed = new EmbedBuilder()
        .setTitle("📋 Logging Options Updated")
        .setDescription("Successfully updated the logging settings!")
        .setColor("Green")
        .addFields(
          { name: "Category:", value: event, inline: true },
          {
            name: "Status:",
            value: enabled ? "Enabled" : "Disabled",
            inline: true,
          },
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      await errorSend(
        {
          user: interaction.user.username,
          command: interaction.commandName,
          error: error.message,
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
