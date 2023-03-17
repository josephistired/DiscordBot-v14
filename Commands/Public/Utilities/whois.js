function addSuffix(number) {
  if (number % 100 >= 11 && number % 100 <= 13) return number + "th";

  switch (number % 10) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
  }
  return number + "th";
}

function addBadges(badgeNames) {
  if (!badgeNames.length) return ["X"];
  const badgeMap = {
    ActiveDeveloper: "<:activedeveloper:1086315311973802004>",
    BugHunterLevel1: "<:discordbughunter1:1086315317241852025>",
    BugHunterLevel2: "<:discordbughunter2:1086315319343198288> ",
    PremiumEarlySupporter: "<:discordearlysupporter:1086315320622448822>",
    Partner: "<:discordpartner:1086315326578368532>",
    Staff: "<:discordstaff:1086315331070476288>",
    HypeSquadOnlineHouse1: "<:hypesquadbravery:1086315334815993856>", // bravery
    HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1086315653927030864>", // brilliance
    HypeSquadOnlineHouse3: "<:hypesquadbalance:1086315333498978383>", // balance
    Hypesquad: "<:hypesquadevents:1086315338569879605>",
    CertifiedModerator: "<:discordmod:1086315323067748432>",
    VerifiedDeveloper: "<:discordbotdev:1086315315836764250>",
  };

  return badgeNames.map((badgeName) => badgeMap[badgeName] || "❓");
}

const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");

const { profileImage } = require("discord-arts");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Displays information on your or another user.")
    .setDMPermission(false)
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user.")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    const member = interaction.options.getUser("user") || interaction.member;

    if (member.user.bot)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⛔ Error executing command")
            .setColor("Red")
            .setImage(
              "https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif"
            )
            .addFields(
              {
                name: "User:",
                value: `\`\`\`${interaction.user.username}\`\`\``,
              },
              {
                name: "Reasons:",
                value: `\`\`\`At this moment, bots are not supported for this command. Sorry!\`\`\``,
              }
            ),
        ],
        ephemeral: true,
      });

    try {
      const fetchedMembers = await interaction.guild.members.fetch();

      const profileBuffer = await profileImage(member.id);
      const imageAttachment = new AttachmentBuilder(profileBuffer, {
        name: "profile.png",
      });

      const joinedPosition =
        Array.from(
          fetchedMembers
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
            .keys()
        ).indexOf(member.id) + 1;

      const topRoles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((role) => role);

      const userBadges = member.user.flags.toArray();

      const joinTime = parseInt(member.joinedTimestamp / 1000);
      const createdTime = parseInt(member.user.createdTimeStamp / 1000);

      const Booster = member.premiumSince
        ? "<:discordboost7:1086315313458593982>"
        : "✖";

      const whoisembed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag} | General Information`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(member.displayColor)
        .setDescription(
          `On <t:${joinTime}:D>, ${
            member.user.username
          } joined  as the **${addSuffix(joinedPosition)}** member of ${
            interaction.guild.name
          } `
        )
        .setImage("attachment://profile.png")
        .addFields([
          {
            name: "Badges",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          {
            name: "Booster",
            value: `${Booster}`,
            inline: true,
          },
          {
            name: "Roles",
            value: `${topRoles.join("").replace(`<@${interaction.guildId}>`)}`,
            inline: false,
          },
          {
            name: "Created",
            value: `<t:${createdTime}:R>`,
            inline: true,
          },
          {
            name: "Joined",
            value: `<t:${joinTime}:R>`,
            inline: true,
          },
          {
            name: "Identifier",
            value: `${member.id}`,
            inline: false,
          },
          {
            name: "Avatar",
            value: `[Link](${member.displayAvatarURL()})`,
            inline: true,
          },
          {
            name: "Banner",
            value: `[Link](${(await member.fetch()).bannerURL()})`,
            inline: true,
          },
        ])
        .setTimestamp();

      interaction.editReply({ embeds: [whoisembed], files: [imageAttachment] });
    } catch (error) {
      interaction.reply({
        content:
          "An error occured. Try again later or contact the hoster of this bot.",
      });
    }
  },
};
