const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/infractions");

module.exports = {
  subCommand: "infractions.remove",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const user = options.getMember("user");
    const reason = options.getString("reason");

    let userData = await Database.findOneAndUpdate({
      Guild: guild.id,
      User: user.id,
      Infractions: [],
    });

    const successEmbed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      })
      .setColor("Green")
      .addFields(
        {
          name: "User:",
          value: `\`\`\`${user.user.tag}\`\`\``,
        },
        {
          name: "Reason:",
          value: `\`\`\`${reason}\`\`\``,
        },
        {
          name: "Moderator:",
          value: `\`\`\`${member.user.username}\`\`\``,
        }
      );

    console.log(`
    \nWarning: Moderator Reset's A User's Infraction Count - Look Above For User Who Executed The Reset.
    \nUser Whose's Infractions Were Reset:\n${user.user.tag}
    `);

    interaction.reply({ embeds: [successEmbed], ephemeral: true });
  },
};
