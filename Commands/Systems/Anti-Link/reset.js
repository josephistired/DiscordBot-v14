const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/infractions");
const { moderationlogSend } = require("../../../Functions/moderationlogSend");

module.exports = {
  subCommand: "link.reset",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const user = options.getMember("user");
    const reason = options.getString("reason");

    try {
      let userData = await Database.findOne({ Guild: guild.id, User: user.id });
      if (!userData)
        return interaction.reply({
          content: `No discord invite data found for ${user}.`,
          ephemeral: true,
        });
      userData = await Database.findOneAndUpdate({
        Guild: guild.id,
        User: user.id,
        linkCount: 0,
      });

      const successEmbed = new EmbedBuilder()
        .setTitle("🔗 Discord Invite Data")
        .setDescription(`Successfully reset ${user} Discord invite data.`)
        .setTimestamp()
        .setColor("Green");

      interaction.reply({ embeds: [successEmbed], ephemeral: true });

      moderationlogSend(
        {
          action: "Discord Invite Remove",
          moderator: `${member.user.username}`,
          user: `${user.user.tag}`,
          reason: `${reason}`,
        },
        interaction
      );
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "An error occurred! Try again later",
        ephemeral: true,
      });
    }
  },
};
