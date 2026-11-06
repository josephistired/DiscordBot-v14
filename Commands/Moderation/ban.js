const {
  MessageFlags,
  InteractionContextType,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { validateTarget } = require("../../Functions/moderationTarget");

const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(InteractionContextType.Guild)
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
  async execute(interaction) {
    const target = interaction.options.getMember("user");
    validateTarget(interaction, target, "bannable");
    const reason = interaction.options.getString("reason") || "Not specified";
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await target.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason });
    await interaction.editReply({ content: `Banned ${target.user.tag}.` });
    await moderationlogSend(
      {
        action: "Ban",
        moderator: interaction.user.tag,
        user: target.user.tag,
        reason,
      },
      interaction,
    );
  },
};
