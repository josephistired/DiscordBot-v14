const {
  MessageFlags,
  InteractionContextType,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { validateTarget } = require("../../Functions/moderationTarget");

const ms = require("ms");

const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeouts a user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setContexts(InteractionContextType.Guild)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true),
    )
    .addStringOption((options) =>
      options
        .setName("duration")
        .setDescription("Give the timeout a duration (1m, 1h, 1d).")
        .setRequired(true),
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the timeout of this user?")
        .setMaxLength(512),
    ),
  async execute(interaction) {
    const target = interaction.options.getMember("user");
    validateTarget(interaction, target, "moderatable");
    const reason = interaction.options.getString("reason") || "Not specified";
    const duration = ms(interaction.options.getString("duration"));
    if (!Number.isFinite(duration) || duration <= 0 || duration > ms("28d")) {
      throw new Error(
        "Duration must be greater than zero and at most 28 days.",
      );
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await target.timeout(duration, reason);
    await interaction.editReply({
      content: `Timed out ${target.user.tag}. Duration: ${ms(duration, { long: true })}.`,
    });
    await moderationlogSend(
      {
        action: "Timeout",
        moderator: interaction.user.tag,
        user: target.user.tag,
        reason,
        duration: ms(duration, { long: true }),
      },
      interaction,
    );
  },
};
