const { GuildMember, EmbedBuilder } = require("discord.js");
const Database = require("../../schemas/welcome");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    Database.findOne({ Guild: member.guild.id }, async (err, data) => {
      if (!data) return;
      let channel = data.WelcomeChannel;
      let message =
        data.WelcomeMessage ||
        `Welcome ${member.user} to ${member.guild}, enjoy your stay!`;
      let color = data.WelcomeColor;
      let role = data.WelcomeRole;

      const { guild } = member;
      const WelcomeChannel = guild.channels.cache.get(channel);
      const icon = guild.iconURL();

      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`***New member***`)
        .setDescription(message)
        .setColor(color)
        .setThumbnail(icon)
        .setTimestamp();

      WelcomeChannel.send({ embeds: [welcomeEmbed] });
      member.roles.add(role);
    });
  },
};
