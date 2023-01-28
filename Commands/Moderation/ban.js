const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the ban of this user?")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const reason = options.getString("reason") || "Not specified";

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    if (!user)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "The user has most likely abandoned the server."
          ),
        ],
        ephemeral: true,
      });

    if (!user.manageable || !user.moderatable)
      errorsArray.push("This bot cannot moderate the selected user.");

    if (member.roles.highest.position < user.roles.highest.position)
      errorsArray.push("Selected user has a higher role than you.");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [
          errorEmbed.addFields(
            {
              name: "User:",
              value: `\`\`\`${interaction.user.username}\`\`\``,
            },
            {
              name: "Reasons:",
              value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
            }
          ),
        ],
        ephemeral: true,
      });

    await user.ban({
      days: 7,
      reason: reason,
    });

    const successEmbed = new EmbedBuilder().setColor("Green");

    return (
      interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `🔨 \n Banned \`${user.user.tag}\` from the server!`
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
        interaction
      )
    );
  },
};
