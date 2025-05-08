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
  async execute(member) {
    // Welcome System
    const data = await welcomeDatabase.findOne({ Guild: member.guild.id });
    if (!data) return;

    const channel = data.welcomeChannel;
    let message =
      data.welcomeMessage ||
      `Welcome ${member.user} to ${member.guild}, enjoy your stay!`;
    let wcolor = data.welcomeColor || "Green";

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
      .setColor(wcolor)
      .setThumbnail(icon)
      .setTimestamp();

    welcomeChannel.send({ embeds: [welcomeEmbed] });

    // Member Risk System Logging
    const logdata = await logDatabase.findOne({ Guild: member.guild.id });
    if (!logdata) return;

    const logchannel = member.guild.channels.cache.get(logdata.logChannel);

    let lcolor = "#74e21e";
    let risk = "Fairly Safe";

    const accountCreation = parseInt(member.user.createdTimestamp / 1000, 10);
    const joiningTime = parseInt(member.joinedAt / 1000, 10);

    const monthsAgo = moment().subtract(2, "months").unix();
    const weeksAgo = moment().subtract(2, "weeks").unix();
    const daysAgo = moment().subtract(2, "days").unix();

    if (accountCreation >= monthsAgo) {
      lcolor = "#e2bb1e";
      risk = "Medium";
    }
    if (accountCreation >= weeksAgo) {
      lcolor = "#e24d1e";
      risk = "High";
    }
    if (accountCreation >= daysAgo) {
      lcolor = "#e24e1e";
      risk = "Extreme";
    }

    const riskEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.tag} | ${member.user.id}`,
        iconURL: member.displayAvatarURL({ dynamic: true }),
      })
      .setColor(lcolor)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        [
          `👤 User: ${member.user}`,
          `❔ Account Type: ${member.user.bot ? "Bot" : "User"} `,
          `❔ Role Assigned: ${role}`,
          `☢️ Risk Level: ${risk}`,
          `✍🏻 Account Created: <t:${accountCreation}:D> | <t:${accountCreation}:R>`,
          `👥 Account Joined: <t:${joiningTime}:D> | <t:${joiningTime}:R>`,
        ].join("\n"),
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
          .setStyle(ButtonStyle.Danger),
      );

      await logchannel.send({
        embeds: [riskEmbed],
        components: [Buttons],
      });
    } else return logchannel.send({ embeds: [riskEmbed] });
  },
};
