const {
  GuildMember,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const moment = require("moment");
const welcomeDatabase = require("../../Schemas/welcome");
const logDatabase = require("../../Schemas/logs");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {GuildMember} member
   */
  async execute(member, client) {
    // Welcome System

    welcomeDatabase.findOne({ Guild: member.guild.id }, async (err, data) => {
      if (!data) return;

      let channel = data.welcomeChannel;
      let message =
        data.welcomeMessage ||
        `Welcome ${member.user} to ${member.guild}, enjoy your stay!`;
      let color = data.welcomeColor || "Green";

      let role = data.welcomeRole;
      member.roles.add(role).catch(() => {
        role = "Role selected is higher than the bot.";
      });

      const { guild } = member;
      const welcomeChannel = guild.channels.cache.get(channel);
      const icon = guild.iconURL();

      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`***New member!***`)
        .setDescription(message)
        .setImage(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setColor(color)
        .setThumbnail(icon)
        .setTimestamp();

      welcomeChannel.send({ embeds: [welcomeEmbed] });

      // Member Risk System Logging

      logDatabase.findOne({ Guild: member.guild.id }, async (err, data) => {
        if (!data) return;

        const channel = member.guild.channels.cache.get(data.logChannel);

        let color = "#74e21e";
        let risk = "Fairly Safe";

        const accountCreation = parseInt(member.user.createdTimestamp / 1000);
        const joiningTime = parseInt(member.joinedAt / 1000);

        const monthsAgo = moment().subtract(2, "months").unix();
        const weeksAgo = moment().subtract(2, "weeks").unix();
        const daysAgo = moment().subtract(2, "days").unix();

        if (accountCreation >= monthsAgo) {
          color = "#e2bb1e";
          risk = "Medium";
        }
        if (accountCreation >= weeksAgo) {
          color = "#e24d1e";
          risk = "High";
        }
        if (accountCreation >= daysAgo) {
          color = "#e24e1e";
          risk = "Extreme";
        }

        const riskEmbed = new EmbedBuilder()
          .setAuthor({
            name: `${member.user.tag} | ${member.user.id}`,
            iconURL: member.displayAvatarURL({ dynamic: true }),
          })
          .setColor(color)
          .setThumbnail(
            member.user.displayAvatarURL({ dynamic: true, size: 256 })
          )
          .setDescription(
            [
              `👤 User: ${member.user}`,
              `❔ Account Type: ${member.user.bot ? "Bot" : "User"} `,
              `❔ Role Assigned: ${role}`,
              `☢️ Risk Level: ${risk}`,
              `✍🏻 Account Created: <t:${accountCreation}:D> | <t:${accountCreation}:R>`,
              `👥 Account Joined: <t:${joiningTime}:D> | <t:${joiningTime}:R>`,
            ].join("\n")
          )
          .setFooter({ text: "User Joined" })
          .setTimestamp();

        if (risk === "Extreme" || risk === "High") {
          const Buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`MemberLogging-Kick-${member.id}`)
              .setLabel("Kick")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`MemberLogging-Ban-${member.id}`)
              .setLabel("Ban")
              .setStyle(ButtonStyle.Danger)
          );

          await channel.send({
            embeds: [riskEmbed],
            components: [Buttons],
          });
        } else return channel.send({ embeds: [riskEmbed] });
      });
    });
  },
};
