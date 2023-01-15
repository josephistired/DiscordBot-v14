const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/infractions");

module.exports = {
  subCommand: "infractions.reset",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const user = options.getMember("user");
    const reason = options.getString("reason");

    const logChannel = interaction.guild.channels.cache.get(""); // CHANGE TO YOUR LOGGING CHANNEL

    let userData = await Database.findOneAndUpdate({
      Guild: guild.id,
      User: user.id,
      Infractions: [],
    });

    const successEmbed = new EmbedBuilder().setColor("Green");
    const logEmbed = new EmbedBuilder()
      .setColor("Green")
      .setAuthor({ name: "➖ Infraction Reset Command Executed" })
      .setTimestamp()
      .addFields(
        {
          name: "👤 User:",
          value: `\`\`\`${user.user.tag}\`\`\``,
        },
        {
          name: "❔ Reason:",
          value: `\`\`\`${reason}\`\`\``,
        },
        {
          name: "👮🏻 Moderator:",
          value: `\`\`\`${member.user.username}\`\`\``,
        }
      );

    return (
      interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `➖ \n Reset \`${user.user.tag}\` infraction count`
          ),
        ],
        ephemeral: true,
      }),
      logChannel.send({
        embeds: [logEmbed],
      })
    );
  },
};
