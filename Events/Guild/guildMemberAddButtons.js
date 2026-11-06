const { Events, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { validateTarget } = require("../../Functions/moderationTarget");
const { moderationlogSend } = require("../../Functions/moderationlogSend");
const { errorSend } = require("../../Functions/errorlogSend");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith("MemberLogging-")
    )
      return;
    try {
      if (!interaction.inCachedGuild())
        throw new Error("Use this action in a server.");
      const [, action, targetId] = interaction.customId.split("-");
      if (!["Kick", "Ban"].includes(action)) return;
      const permission =
        action === "Ban"
          ? PermissionFlagsBits.BanMembers
          : PermissionFlagsBits.KickMembers;
      if (!interaction.memberPermissions.has(permission))
        throw new Error(
          `You lack permission to ${action.toLowerCase()} members.`,
        );
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const target = await interaction.guild.members
        .fetch(targetId)
        .catch(() => null);
      validateTarget(
        interaction,
        target,
        action === "Ban" ? "bannable" : "kickable",
      );
      const reason = `Member logging action by ${interaction.user.tag}`;
      if (action === "Ban") await target.ban({ reason });
      else await target.kick(reason);
      await interaction.editReply(
        `${action === "Ban" ? "Banned" : "Kicked"} ${target.user.tag}.`,
      );
      await moderationlogSend(
        {
          action,
          moderator: interaction.user.tag,
          user: target.user.tag,
          reason,
        },
        interaction,
      );
    } catch (error) {
      await errorSend(
        {
          user: interaction.user.tag,
          command: "Member logging",
          time: Math.floor(interaction.createdTimestamp / 1000),
          error: error.message,
        },
        interaction,
      );
    }
  },
};
