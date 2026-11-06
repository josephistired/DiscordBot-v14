const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../../Schemas/verification");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "verification.unprotect",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const config = await Database.findOne({ Guild: interaction.guildId });
      const me =
        interaction.guild.members.me ??
        (await interaction.guild.members.fetchMe());

      if (!config) throw new Error("Verification is not configured.");
      const category = interaction.options.getChannel("category", true);
      if (
        !interaction.memberPermissions.has(
          PermissionFlagsBits.ManageChannels,
        ) ||
        !category
          .permissionsFor(me)
          ?.has([
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
          ])
      )
        throw new Error(
          "You and the bot need channel-management permissions; the bot also needs Manage Roles here.",
        );
      if (interaction.options.getBoolean("confirm") !== true)
        throw new Error(
          "No permissions changed. Set confirm to true to restore saved overwrites.",
        );
      const snapshot = config.gates?.get(category.id);
      if (!snapshot)
        throw new Error(
          "No saved permission snapshot exists for that category.",
        );
      if (
        [...category.children.cache.values()].some((c) => !c.permissionsLocked)
      )
        throw new Error(
          "Sync or move channels with custom permissions before restoring this category.",
        );
      await category.permissionOverwrites.set(
        snapshot.overwrites.map((o) => ({
          id: o.id,
          type: o.type,
          allow: BigInt(o.allow),
          deny: BigInt(o.deny),
        })),
        `Verification gate removed by ${interaction.user.tag}`,
      );
      await Database.updateOne(
        { Guild: interaction.guildId },
        { $unset: { [`gates.${category.id}`]: 1 } },
      );
      const successEmbed = new EmbedBuilder()
        .setTitle("🔓 Category Restored")
        .setColor("Green")
        .setDescription(
          "Saved category permissions restored. Later manual category overwrite changes were replaced by the snapshot.",
        )
        .setTimestamp();
      await interaction.editReply({
        embeds: [successEmbed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error("Verification unprotect failed:", error);
      await errorSend(
        {
          user: interaction.user.username,
          command: "verification.unprotect",
          error: error.message,
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
