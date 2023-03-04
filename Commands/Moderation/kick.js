const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("messages")
        .setDescription(
          "Select the number of days for which their to messages will be deleted."
        )
        .setRequired(true)
        .addChoices(
          { name: "Don't Delete Any.", value: "0" },
          { name: "Delete Up To Seven Days.", value: "7" }
        )
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide A Reason For The Kick.")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const messages = options.getString("messages");
    const reason = options.getString("reason") || "Not Specified";

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

    await user.kick({
      messages: messages,
      reason: reason,
    });

    const successEmbed = new EmbedBuilder().setColor("Green").setTimestamp();

    return (
      interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `👟 \n Kicked \`${user.user.tag}\` from the server!`
          ),
        ],
        ephemeral: true,
      }),
      moderationlogSend(
        {
          action: "Kick",
          moderator: `${member.user.username}`,
          user: `${user.user.tag}`,
          reason: `${reason}`,
          emoji: "👟",
          messages: `${messages}`,
        },
        interaction
      )
    );
  },
};
