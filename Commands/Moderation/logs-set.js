const { validateConfigChannel } = require("../../Functions/configChannel");
const {
  MessageFlags,
  InteractionContextType,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../Schemas/logs");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("log-set")
    .setDescription("Sets channel for mod logs to be sent to")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .addChannelOption((options) =>
      options
        .setName("channel")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setDescription("Select the Channel.")
        .setRequired(true),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction, client) {
    const channelObject = interaction.options.getChannel("channel");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await validateConfigChannel(interaction, channelObject);

    await Database.findOneAndUpdate(
      { Guild: interaction.guild.id },
      {
        logChannel: channelObject.id,
      },
      {
        new: true,
        upsert: true,
      },
    );

    const success = new EmbedBuilder()
      .setColor("Green")
      .setDescription("Successfully set logs channel!")
      .addFields({
        name: "Channel:",
        value: channelObject.name,
      });

    await interaction.editReply({
      embeds: [success],
    });
  },
};
