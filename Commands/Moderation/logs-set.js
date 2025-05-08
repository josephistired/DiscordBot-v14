const {
  SlashCommandBuilder,
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
    .setDMPermission(false)
    .addChannelOption((options) =>
      options
        .setName("channel")
        .setDescription("Select the Channel.")
        .setRequired(true),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction, client) {
    const channelObject = interaction.options.getChannel("channel");

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

    client.guildConfig.set(interaction.guild.id, {
      logChannel: channelObject.id,
    });

    const success = new EmbedBuilder()
      .setColor("Green")
      .setDescription("Successfully set logs channel!")
      .addFields({
        name: "Channel:",
        value: channelObject.name,
      });

    interaction.reply({
      embeds: [success],
      ephemeral: true,
    });
  },
};
