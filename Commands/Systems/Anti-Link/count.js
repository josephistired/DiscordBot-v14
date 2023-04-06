const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/infractions");

module.exports = {
  subCommand: "link.count",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild } = interaction;

    const user = options.getMember("user");

    try {
      let userData = await Database.findOne({ Guild: guild.id, User: user.id });
      if (!userData)
        return interaction.reply({
          content: `No discord invite data found for ${user}.`,
          ephemeral: true,
        });

      const successEmbed = new EmbedBuilder()
        .setTitle("🔗 Discord Invite Data")
        .setDescription(
          `How many discord invites has ${user} sent in ${interaction.guild}?`
        )
        .setColor("Green")
        .addFields(
          {
            name: "User:",
            value: `${user}`,
          },
          {
            name: "How many have they tried to send:",
            value: `${userData.linkCount} invites`,
          },
          {
            name: "How many more invites until ban:",
            value: `${4 - userData.linkCount} invites`,
          }
        );

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "An error occurred! Try again later",
        ephemeral: true,
      });
    }
  },
};
