const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

const { moderationlogSend } = require("../../Functions/moderationlogSend");
const { errorSend } = require("../../Functions/errorlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true),
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the ban of this user?")
        .setMaxLength(512),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const reason = options.getString("reason") || "Not specified";

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely left the server.");
    } else {
      if (!user.manageable || !user.moderatable) {
        errorsArray.push("This bot cannot moderate the selected user.");
      }

      if (member.roles.highest.position < user.roles.highest.position) {
        errorsArray.push("The user selected has a higher role than you.");
      }
    }

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member.user.username}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction,
      );
    }

    await user.ban({
      days: 7,
      reason: reason,
    });

    const successEmbed = new EmbedBuilder().setColor("Green");

    return (
      interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `🔨 \n Banned \`${user.user.tag}\` from the server!`,
          ),
        ],
        ephemeral: true,
      }),
      moderationlogSend(
        {
          action: "Ban",
          moderator: `${member.user.username}`,
          user: `${user.user.tag}`,
          reason: `${reason}`,
          emoji: "🔨",
        },
        interaction,
      )
    );
  },
};
