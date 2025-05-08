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
    .setName("kick")
    .setDescription("Kicks user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true),
    )
    .addStringOption((options) =>
      options
        .setName("messages")
        .setDescription(
          "Select the number of days for which their to messages will be deleted.",
        )
        .setRequired(true)
        .addChoices(
          { name: "Don't Delete Any.", value: "0" },
          { name: "Delete Up To Seven Days.", value: "7" },
        ),
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide A Reason For The Kick.")
        .setMaxLength(512),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const messages = options.getString("messages");
    const reason = options.getString("reason") || "Not Specified";

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely left the server.");
    } else {
      if (
        !user.kickable ||
        !member.roles.highest.comparePositionTo(user.roles.highest) > 0
      ) {
        errorsArray.push("This bot cannot moderate the selected user.");
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
        interaction,
      );
    }

    await user.kick({
      reason,
      days: messages,
    });

    const successEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`👟 \n Kicked \`${user.user.tag}\` from the server!`)
      .setTimestamp();

    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
    });

    moderationlogSend(
      {
        action: "Kick",
        moderator: `${member.user.username}`,
        user: `${user.user.tag}`,
        reason: `${reason}`,
        emoji: "👟",
        messages: `${messages}`,
      },
      interaction,
    );
  },
};
