const { PermissionFlagsBits: P } = require("discord.js");
const Config = require("../Schemas/verification");
const dangerous = [
  P.Administrator,
  P.ManageGuild,
  P.ManageRoles,
  P.ManageChannels,
  P.BanMembers,
  P.KickMembers,
  P.ModerateMembers,
  P.ManageWebhooks,
  P.MentionEveryone,
  P.ManageMessages,
  P.ManageThreads,
  P.ManageEvents,
  P.ManageGuildExpressions,
  P.CreateGuildExpressions,
  P.ViewAuditLog,
  P.MuteMembers,
  P.DeafenMembers,
  P.MoveMembers,
];
function validateVerificationRole(guild, me, role) {
  if (!me.permissions.has(P.ManageRoles))
    throw new Error("The bot needs Manage Roles.");
  if (
    !role ||
    role.id === guild.id ||
    role.managed ||
    me.roles.highest.comparePositionTo(role) <= 0 ||
    dangerous.some((p) => role.permissions.has(p))
  ) {
    throw new Error(
      "Choose an unmanaged verification role below the bot, without administrative or moderation permissions.",
    );
  }
}
async function verifyMember(interaction) {
  if (!interaction.inCachedGuild())
    throw new Error("Use verification inside a server.");
  const config = await Config.findOne({ Guild: interaction.guildId });
  if (
    !config ||
    config.channel !== interaction.channelId ||
    config.message !== interaction.message.id ||
    interaction.message.author.id !== interaction.client.user.id
  ) {
    throw new Error("This verification panel is no longer active.");
  }
  const me =
    interaction.guild.members.me ?? (await interaction.guild.members.fetchMe());
  const role = await interaction.guild.roles.fetch(config.role);
  validateVerificationRole(interaction.guild, me, role);
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (member.roles.cache.has(role.id)) return "You are already verified.";
  await member.roles.add(role, "Member completed server verification");
  return "You are verified. You can now access the protected channels.";
}
module.exports = { validateVerificationRole, verifyMember };
