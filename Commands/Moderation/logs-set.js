const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Database = require("../../Schemas/logs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("log-set")
    .setDescription("Sets channel for mod logs to be sent to")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((options) =>
      options
        .setName("channel")
        .setDescription("Select the Channel.")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    Database.findOne({ Guild: interaction.guild.id }, async (data) => {
      if (data) data.delete();
      new Database({
        Guild: interaction.guild.id,
        Channel: channel.id,
      }).save();

      interaction.reply({
        content: `${channel} has been set as the logs channel.`,
        ephemeral: true,
      });
    });
  },
};
