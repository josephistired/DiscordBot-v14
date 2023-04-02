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
    .setName("unban")
    .setDescription("Unbans user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("userid")
        .setDescription("Please enter the user's ID.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the unban of this user?")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const userid = options.getString("userid");
    const reason = options.getString("reason") || "Not specified";

    const errorsArray = [];

    const bannedUser = await interaction.guild.bans.fetch();
    const user = bannedUser.get(userid);

    if (!user) {
      errorsArray.push("That user is not banned from the server.");
    }

    try {
      await interaction.guild.members.unban(userid, reason);
    } catch (error) {
      errorsArray.push(
        "An error occurred while attempting to unban the user. Please try again later."
      );
    }

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member.user.username}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }

    const successEmbed = new EmbedBuilder().setColor("Green");

    await interaction.reply({
      embeds: [
        successEmbed.setDescription(
          `🔓 \n Unbanned \`${userid}\` from the server!`
        ),
      ],
      ephemeral: true,
    });

    moderationlogSend(
      {
        action: "Unban",
        moderator: `${member.user.username}`,
        user: `${userid}`,
        reason: `${reason}`,
        emoji: "🔓",
      },
      interaction
    );
  },
};
