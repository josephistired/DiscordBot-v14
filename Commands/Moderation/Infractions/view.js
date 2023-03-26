const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/infractions");

module.exports = {
  subCommand: "infractions.view",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild } = interaction;

    const user = options.getMember("user");

    let userData = await Database.findOne({ Guild: guild.id, User: user.id });
    if (!userData)
      userData = await Database({
        Guild: guild.id,
        User: user.id,
        Infractions: [],
      });

    const successEmbed = new EmbedBuilder()
      .setTimestamp()
      .setColor("Green")
      .addFields(
        {
          name: "User:",
          value: `\`\`\`${user.user.tag}\`\`\``,
        },
        {
          name: "Infraction Count:",
          value: `\`\`\`${userData.Infractions.length}\`\`\``,
        }
      );

    interaction.reply({ embeds: [successEmbed], ephemeral: true });
  },
};
