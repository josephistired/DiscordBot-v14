const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits: P,
  ChannelType,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Config = require("../../../Schemas/verification");
const { validateConfigChannel } = require("../../../Functions/configChannel");
const { validateVerificationRole } = require("../../../Functions/verification");
module.exports = {
  handlesSubcommands: true,
  data: new SlashCommandBuilder()
    .setName("verification")
    .setDescription("Configure role-based server verification")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(P.ManageGuild)
    .addSubcommand((s) =>
      s
        .setName("setup")
        .setDescription("Publish a verification button in a public lobby")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("Public verification lobby")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("Low-privilege verified member role")
            .setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("protect")
        .setDescription("Gate a public category behind the verified role")
        .addChannelOption((o) =>
          o
            .setName("category")
            .setDescription("Public category to protect")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true),
        )
        .addBooleanOption((o) =>
          o
            .setName("confirm")
            .setDescription(
              "Apply permission changes to this category and synced children",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("unprotect")
        .setDescription("Restore a protected category's saved permissions")
        .addChannelOption((o) =>
          o
            .setName("category")
            .setDescription("Protected category")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true),
        )
        .addBooleanOption((o) =>
          o
            .setName("confirm")
            .setDescription(
              "Restore saved overwrites, replacing current category overwrites",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s.setName("status").setDescription("Show current verification setup"),
    ),
  async execute(i) {
    await i.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const action = i.options.getSubcommand();
      const config = await Config.findOne({ Guild: i.guildId });
      if (action === "status")
        return i.editReply(
          config
            ? `Lobby: <#${config.channel}>\nVerified role: <@&${config.role}>\nOnly categories explicitly protected by an admin are gated.`
            : "Verification is not configured.",
        );
      const me = i.guild.members.me ?? (await i.guild.members.fetchMe());
      if (action === "setup") {
        const channel = i.options.getChannel("channel", true);
        const role = i.options.getRole("role", true);
        if (config?.gates?.size && config.role !== role.id)
          throw new Error(
            "Unprotect existing categories before changing the verified role.",
          );
        if (config?.gates?.has(channel.parentId))
          throw new Error(
            "The verification lobby cannot be inside a protected category.",
          );
        await validateConfigChannel(i, channel);
        validateVerificationRole(i.guild, me, role);
        if (!channel.permissionsFor(i.guild.roles.everyone)?.has(P.ViewChannel))
          throw new Error(
            "The verification lobby must be visible to @everyone.",
          );
        const lobbyPermissions = channel.permissionsFor(i.guild.roles.everyone);
        if (
          [
            P.SendMessages,
            P.SendMessagesInThreads,
            P.CreatePublicThreads,
            P.CreatePrivateThreads,
          ].some((permission) => lobbyPermissions?.has(permission))
        ) {
          throw new Error(
            "Make the lobby read-only for @everyone first: deny Send Messages, Send Messages in Threads, and creating threads.",
          );
        }
        const welcome = await require("../../../Schemas/welcome").findOne({
          Guild: i.guildId,
        });
        if (welcome?.welcomeRole === role.id)
          throw new Error(
            "The verified role cannot also be the automatic welcome role.",
          );
        const panel = await channel.send({
          content:
            "Welcome! Click **Verify** to unlock the protected server channels. This is a role gate, not a CAPTCHA or identity check.",
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("verification:verify")
                .setLabel("Verify")
                .setStyle(ButtonStyle.Success),
            ),
          ],
          allowedMentions: { parse: [] },
        });
        try {
          await Config.init();
          await Config.findOneAndUpdate(
            { Guild: i.guildId },
            { channel: channel.id, role: role.id, message: panel.id },
            { upsert: true, new: true },
          );
        } catch (error) {
          await panel.delete().catch(console.error);
          throw error;
        }
        await i.editReply(
          "Verification panel published. Use /verification protect to gate a public category. Keep the lobby outside protected categories. Existing members also need the verified role.",
        );
      } else if (action === "unprotect") {
        if (!config) throw new Error("Verification is not configured.");
        const category = i.options.getChannel("category", true);
        if (
          !i.memberPermissions.has(P.ManageChannels) ||
          !category.permissionsFor(me)?.has([P.ManageChannels, P.ManageRoles])
        )
          throw new Error(
            "You and the bot need channel-management permissions; the bot also needs Manage Roles here.",
          );
        if (i.options.getBoolean("confirm") !== true)
          throw new Error(
            "No permissions changed. Set confirm to true to restore saved overwrites.",
          );
        const snapshot = config.gates?.get(category.id);
        if (!snapshot)
          throw new Error(
            "No saved permission snapshot exists for that category.",
          );
        if (
          [...category.children.cache.values()].some(
            (c) => !c.permissionsLocked,
          )
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
          `Verification gate removed by ${i.user.tag}`,
        );
        await Config.updateOne(
          { Guild: i.guildId },
          { $unset: { [`gates.${category.id}`]: 1 } },
        );
        await i.editReply(
          "Saved category permissions restored. Later manual category overwrite changes were replaced by the snapshot.",
        );
      } else if (action === "protect") {
        if (!config) throw new Error("Run /verification setup first.");
        if (i.options.getBoolean("confirm") !== true)
          throw new Error(
            "No permissions changed. Set confirm to true to apply the category gate.",
          );
        const category = i.options.getChannel("category", true);
        if (
          !i.memberPermissions.has(P.ManageChannels) ||
          !category.permissionsFor(me)?.has([P.ManageChannels, P.ManageRoles])
        )
          throw new Error(
            "You and the bot need channel-management permissions; the bot also needs Manage Roles here.",
          );
        const lobby = await i.guild.channels.fetch(config.channel);
        if (lobby?.parentId === category.id)
          throw new Error(
            "Move the verification lobby outside this category first.",
          );
        const role = await i.guild.roles.fetch(config.role);
        validateVerificationRole(i.guild, me, role);
        const currentEveryone = category.permissionOverwrites.cache.get(
          i.guildId,
        );
        const currentVerified = category.permissionOverwrites.cache.get(
          role.id,
        );
        const alreadyGated =
          currentEveryone?.deny.has(P.ViewChannel) &&
          currentVerified?.allow.has(P.ViewChannel);
        if (
          !alreadyGated &&
          !category.permissionsFor(i.guild.roles.everyone)?.has(P.ViewChannel)
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
            o.id !== i.guildId &&
            o.id !== role.id &&
            o.id !== me.id &&
            o.allow.has(P.ViewChannel),
        );
        if (bypass)
          throw new Error(
            "Remove explicit View Channel allows for other roles/members from this public category before protecting it. Administrators always bypass channel gates.",
          );
        const overwrites = [
          ...category.permissionOverwrites.cache.values(),
        ].map((o) => ({
          id: o.id,
          type: o.type,
          allow: o.allow.bitfield,
          deny: o.deny.bitfield,
        }));
        if (!config.gates?.has(category.id)) {
          if (alreadyGated)
            throw new Error(
              "This category is already gated without a saved snapshot. Restore its public permissions manually before protecting it.",
            );
          // Save the recovery snapshot before making any Discord permission changes.
          await Config.updateOne(
            { Guild: i.guildId },
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
        set(me.id, P.ViewChannel | P.ManageChannels | P.ManageRoles, 0n, 1);
        set(i.guildId, 0n, P.ViewChannel, 0);
        set(role.id, P.ViewChannel, 0n, 0);
        await category.permissionOverwrites.set(
          overwrites,
          `Verification gate configured by ${i.user.tag}`,
        );
        await i.editReply(
          "Category protected. Synced children inherit the gate. Give the verified role to existing trusted members; review any future unsynced channels or role overrides.",
        );
      }
    } catch (error) {
      console.error("Verification setup failed:", error);
      await i.editReply({
        content: error.message,
        allowedMentions: { parse: [] },
      });
    }
  },
};
