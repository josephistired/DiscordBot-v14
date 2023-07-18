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
    .setName("kick")
    .setDescription("Kicks a user from the server")
    .setDefaultPermission(false)
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user").setRequired(true)
    )
    .addIntegerOption((options) =>
      options
        .setName("messages")
        .setDescription("Select the number of days for which their messages will be deleted")
        .setRequired(true)
        .addChoices([
          { name: "Don't Delete Any", value: 0 },
          { name: "Delete Up To Seven Days", value: 7 }
        ])
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide a reason for the kick")
        .setMaxLength(512)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const messages = options.getInteger("messages");
    const reason = options.getString("reason") || "Not specified";

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user is not found or has left the server.");
    } else {
      if (!user.kickable || member.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
        errorsArray.push("This bot cannot moderate the selected user.");
      }
    }

    if (errorsArray.length) {
      return errorSend(
        {
          user: member.user.username,
          command: interaction.commandName,
          error: errorsArray.join("\n"),
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction
      );
    }

    await user.kick({
      reason,
      days: messages,
    });

    const successEmbed = new MessageEmbed()
      .setColor("GREEN")
      .setDescription(`👟\n Kicked \`${user.user.tag}\` from the server!`)
      .setTimestamp();

    interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
    });

    moderationlogSend(
      {
        action: "Kick",
        moderator: member.user.username,
        user: user.user.tag,
        reason: reason,
        emoji: "👟",
        messages: messages.toString(),
      },
      interaction
    );
  },
};
