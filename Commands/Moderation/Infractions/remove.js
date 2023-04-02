const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/infractions");
const { moderationlogSend } = require("../../../Functions/moderationlogSend");

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

    await Database.findOneAndUpdate({
      Guild: guild.id,
      User: user.id,
      Infractions: [],
    });

    const successEmbed = new EmbedBuilder().setColor("Green");

    return (
      interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `➖ \n Reset \`${user.user.tag}\` infraction count`
          ),
        ],
        ephemeral: true,
      }),
      moderationlogSend(
        {
          action: "Infraction Remove",
          moderator: `${member.user.username}`,
          user: `${user.user.tag}`,
          reason: `${reason}`,
        },
        interaction
      )
    );
  },
};
