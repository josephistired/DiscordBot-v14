const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const ms = require("ms");

const { moderationlogSend } = require("../../Functions/moderationlogSend");
const { errorSend } = require("../../Functions/errorlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeouts a user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("duration")
        .setDescription("Give the timeout a duration (1m, 1h, 1d).")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the timeout of this user?")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const user = options.getMember("user");
    const duration = options.getString("duration");
    const reason = options.getString("reason") || "Not specified";

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely left the server.");
    } else {
      if (!user.manageable || !user.moderatable)
        errorsArray.push("This bot cannot moderate the selected user.");
    }

    if (user && member.roles.highest.position < user.roles.highest.position) {
      errorsArray.push("The user has a higher role than you.");
    }

    if (!ms(duration) || ms(duration) > ms("28d"))
      errorsArray.push("Invade Duration / Also Exceeds the 28-Day Limit.");

    user.timeout(ms(duration), reason).catch((err) => {
      errorsArray.push(
        `Due to an unknown error, we were unable to timeout the user. ${err}`
      );
    });

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member.user.username}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction
      );
    }

    const successEmbed = new EmbedBuilder().setColor("Green");

    try {
      await interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `⌛ \n Timeout \`${user.user.tag} for ${ms(
              ms(duration, { long: true })
            )}!\` `
          ),
        ],
        ephemeral: true,
      });
      await moderationlogSend(
        {
          action: "Timeout",
          moderator: `${member.user.username}`,
          user: `${user.user.tag}`,
          reason: `${reason}`,
          duration: `${ms(ms(duration, { long: true }))}`,
        },
        interaction
      );
    } catch (error) {
      return errorSend(
        {
          user: `${member.user.username}`,
          command: `${interaction.commandName}`,
          error: `${error}`,
          time: `${parseInt(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }
  },
};
