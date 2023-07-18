const {
  SlashCommandBuilder,
  Permissions,
  ChatInputCommandInteraction,
  MessageEmbed,
} = require("discord.js");

const { moderationlogSend } = require("../../Functions/moderationlogSend");
const { errorSend } = require("../../Functions/errorlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the server")
    .setDefaultPermission(false)
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user").setRequired(true)
    )
    .addStringOption((options) =>
      options.setName("reason").setDescription("The reason for banning this user").setMaxLength(512)
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
      errorsArray.push("The user is not found or has left the server.");
    } else {
      if (!user.manageable || !user.bannable) {
        errorsArray.push("This bot cannot ban the selected user.");
      }

      if (member.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
        errorsArray.push("The selected user has a higher or equal role compared to you.");
      }
    }

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member.user.username}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${Math.floor(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }

    await user.ban({
      days: 7,
      reason: reason,
    });

    const successEmbed = new MessageEmbed().setColor("GREEN");

    interaction.reply({
      embeds: [
        successEmbed.setDescription(`🔨\n Banned \`${user.user.tag}\` from the server!`),
      ],
      ephemeral: true,
    });

    moderationlogSend(
      {
        action: "Ban",
        moderator: `${member.user.username}`,
        user: `${user.user.tag}`,
        reason: `${reason}`,
        emoji: "🔨",
      },
      interaction
    );
  },
};
