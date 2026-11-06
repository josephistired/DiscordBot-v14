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
    .setName("kick")
    .setDescription("Kicks user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
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
        .setDescription("Provide A Reason For The Kick.")
        .setMaxLength(512),
    ),
  async execute(interaction) {
    const target = interaction.options.getMember("user");
    validateTarget(interaction, target, "kickable");
    const reason = interaction.options.getString("reason") || "Not specified";
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await target.kick(reason);
    await interaction.editReply({ content: `Kicked ${target.user.tag}.` });
    await moderationlogSend(
      {
        action: "Kick",
        moderator: interaction.user.tag,
        user: target.user.tag,
        reason,
      },
      interaction,
    );
  },
};
