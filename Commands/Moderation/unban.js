const {
  MessageFlags,
  InteractionContextType,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(InteractionContextType.Guild)
    .addStringOption((options) =>
      options
        .setName("userid")
        .setDescription("Please enter the user's ID.")
        .setRequired(true),
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the unban of this user?")
        .setMaxLength(512),
    ),
  async execute(interaction) {
    const id = interaction.options.getString("userid", true);
    if (!/^\d{17,20}$/.test(id))
      throw new Error("Provide a valid Discord user ID.");
    const reason = interaction.options.getString("reason") || "Not specified";
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const ban = await interaction.guild.bans.fetch(id);
    await interaction.guild.members.unban(id, reason);
    await interaction.editReply(`Unbanned ${ban.user.tag}.`);
    await moderationlogSend(
      {
        action: "Unban",
        moderator: interaction.user.tag,
        user: ban.user.tag,
        reason,
      },
      interaction,
    );
  },
};
