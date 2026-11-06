const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const Database = require("../../../Schemas/verification");
const { validateVerificationRole } = require("../../../Functions/verification");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "verification.protect",
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

      if (!config) throw new Error("Run /verification setup first.");
      if (interaction.options.getBoolean("confirm") !== true)
        throw new Error(
          "No permissions changed. Set confirm to true to apply the category gate.",
        );
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
      const lobby = await interaction.guild.channels.fetch(config.channel);
      if (lobby?.parentId === category.id)
        throw new Error(
          "Move the verification lobby outside this category first.",
        );
      const role = await interaction.guild.roles.fetch(config.role);
      validateVerificationRole(interaction.guild, me, role);
      const currentEveryone = category.permissionOverwrites.cache.get(
        interaction.guildId,
      );
      const currentVerified = category.permissionOverwrites.cache.get(role.id);
      const alreadyGated =
        currentEveryone?.deny.has(PermissionFlagsBits.ViewChannel) &&
        currentVerified?.allow.has(PermissionFlagsBits.ViewChannel);
      if (
        !alreadyGated &&
        !category
          .permissionsFor(interaction.guild.roles.everyone)
          ?.has(PermissionFlagsBits.ViewChannel)
      )
        throw new Error(
          "Protect only public categories; private category permissions must be configured manually.",
        );
      const children = [...category.children.cache.values()];
      if (children.some((channel) => !channel.permissionsLocked))
        throw new Error(
          "This category has channels with custom permissions. Sync or move them before applying the gate.",
        );
      // Other role/member allows can bypass Discord role gates. Refuse rather than silently removing them.
      const bypass = category.permissionOverwrites.cache.some(
        (o) =>
          o.id !== interaction.guildId &&
          o.id !== role.id &&
          o.id !== me.id &&
          o.allow.has(PermissionFlagsBits.ViewChannel),
      );
      if (bypass)
        throw new Error(
          "Remove explicit View Channel allows for other roles/members from this public category before protecting it. Administrators always bypass channel gates.",
        );
      const overwrites = [...category.permissionOverwrites.cache.values()].map(
        (o) => ({
          id: o.id,
          type: o.type,
          allow: o.allow.bitfield,
          deny: o.deny.bitfield,
        }),
      );
      if (!config.gates?.has(category.id)) {
        if (alreadyGated)
          throw new Error(
            "This category is already gated without a saved snapshot. Restore its public permissions manually before protecting it.",
          );
        // Save the recovery snapshot before making any Discord permission changes.
        await Database.updateOne(
          { Guild: interaction.guildId },
          {
            $set: {
              [`gates.${category.id}`]: {
                overwrites: overwrites.map((o) => ({
                  ...o,
                  allow: String(o.allow),
                  deny: String(o.deny),
                })),
              },
            },
          },
        );
      }
      const set = (id, allow, deny, type) => {
        const old = overwrites.find((o) => o.id === id);
        if (old) {
          old.allow = (old.allow | allow) & ~deny;
          old.deny = (old.deny | deny) & ~allow;
        } else overwrites.push({ id, type, allow, deny });
      };
      // Keep the bot able to manage the category before denying @everyone.
      set(
        me.id,
        PermissionFlagsBits.ViewChannel |
          PermissionFlagsBits.ManageChannels |
          PermissionFlagsBits.ManageRoles,
        0n,
        1,
      );
      set(interaction.guildId, 0n, PermissionFlagsBits.ViewChannel, 0);
      set(role.id, PermissionFlagsBits.ViewChannel, 0n, 0);
      await category.permissionOverwrites.set(
        overwrites,
        `Verification gate configured by ${interaction.user.tag}`,
      );
      const successEmbed = new EmbedBuilder()
        .setTitle("🔒 Category Protected")
        .setColor("Green")
        .setDescription(
          "Category protected. Synced children inherit the gate. Give the verified role to existing trusted members; review any future unsynced channels or role overrides.",
        )
        .setTimestamp();
      await interaction.editReply({
        embeds: [successEmbed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error("Verification protect failed:", error);
      await errorSend(
        {
          user: interaction.user.username,
          command: "verification.protect",
          error: error.message,
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
