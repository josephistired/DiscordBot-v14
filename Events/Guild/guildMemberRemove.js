const { GuildMember, EmbedBuilder } = require("discord.js");
const logDatabase = require("../../Schemas/logs");

module.exports = {
  name: "guildMemberRemove",
  /**
   *
   * @param {GuildMember} member
   */
  async execute(member) {
    logDatabase.findOne({ Guild: member.guild.id }, async (data) => {
      if (!data) return;

      const channel = member.guild.channels.cache.get(data.logChannel);

      const accountCreation = parseInt(member.user.createdTimestamp / 1000);
      const joiningTime = parseInt(member.joinedAt / 1000);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag} | ${member.user.id}`,
          iconURL: member.displayAvatarURL({ dynamic: true }),
        })
        .setThumbnail(
          member.user.displayAvatarURL({ dynamic: true, size: 256 })
        )
        .setDescription(
          [
            `👤 User: ${member.user}`,
            `❔ Account Type: ${member.user.bot ? "Bot" : "User"} `,
            `✍🏻 Account Created: <t:${accountCreation}:D> | <t:${accountCreation}:R>`,
            `👥 Account Joined: <t:${joiningTime}:D> | <t:${joiningTime}:R>`,
          ].join("\n")
        )
        .setFooter({ text: "User Left.]" })
        .setTimestamp();

      channel.send({ embeds: [embed] });
    });
  },
};
