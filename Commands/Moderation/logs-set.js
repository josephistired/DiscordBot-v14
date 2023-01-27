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
    .addStringOption((options) =>
      options
        .setName("channel")
        .setDescription("Provide the channel ID")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction) {
    const channel = interaction.options.getString("channel");

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    if (!interaction.guild.channels.cache.get(channel))
      errorsArray.push("Please provide a valid channel ID.");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [
          errorEmbed.addFields(
            {
              name: "User:",
              value: `\`\`\`${interaction.user.username}\`\`\``,
            },
            {
              name: "Reasons:",
              value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
            }
          ),
        ],
        ephemeral: true,
      });

    Database.findOne({ Guild: interaction.guild.id }, async (err, data) => {
      if (data) data.delete();
      new Database({
        Guild: interaction.guild.id,
        Channel: channel,
      }).save();

      interaction.reply({
        content: `${channel} has been set as the logs channel.`,
        ephemeral: true,
      });
    });
  },
};
