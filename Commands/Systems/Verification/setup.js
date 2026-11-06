const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Database = require("../../../Schemas/verification");
const { validateConfigChannel } = require("../../../Functions/configChannel");
const { validateVerificationRole } = require("../../../Functions/verification");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "verification.setup",
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

      const channel = interaction.options.getChannel("channel", true);
      const role = interaction.options.getRole("role", true);
      if (config?.gates?.size && config.role !== role.id)
        throw new Error(
          "Unprotect existing categories before changing the verified role.",
        );
      if (config?.gates?.has(channel.parentId))
        throw new Error(
          "The verification lobby cannot be inside a protected category.",
        );
      await validateConfigChannel(interaction, channel);
      validateVerificationRole(interaction.guild, me, role);
      if (
        !channel
          .permissionsFor(interaction.guild.roles.everyone)
          ?.has(PermissionFlagsBits.ViewChannel)
      )
        throw new Error("The verification lobby must be visible to @everyone.");
      const lobbyPermissions = channel.permissionsFor(
        interaction.guild.roles.everyone,
      );
      if (
        [
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.SendMessagesInThreads,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
        ].some((permission) => lobbyPermissions?.has(permission))
      ) {
        throw new Error(
          "Make the lobby read-only for @everyone first: deny Send Messages, Send Messages in Threads, and creating threads.",
        );
      }
      const welcome = await require("../../../Schemas/welcome").findOne({
        Guild: interaction.guildId,
      });
      if (welcome?.welcomeRole === role.id)
        throw new Error(
          "The verified role cannot also be the automatic welcome role.",
        );
      const panel = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔐 Server Verification")
            .setDescription(
              "Welcome! Click **Verify** to unlock the protected server channels. This is a role gate, not a CAPTCHA or identity check.",
            )
            .setColor("Green")
            .setTimestamp(),
        ],
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
        await Database.init();
        await Database.findOneAndUpdate(
          { Guild: interaction.guildId },
          { channel: channel.id, role: role.id, message: panel.id },
          { upsert: true, new: true },
        );
      } catch (error) {
        await panel.delete().catch(console.error);
        throw error;
      }
      const successEmbed = new EmbedBuilder()
        .setTitle("✅ Verification Setup")
        .setColor("Green")
        .setDescription(
          "Verification panel published. Use /verification protect to gate a public category. Keep the lobby outside protected categories. Existing members also need the verified role.",
        )
        .setTimestamp();
      await interaction.editReply({
        embeds: [successEmbed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error("Verification setup failed:", error);
      await errorSend(
        {
          user: interaction.user.username,
          command: "verification.setup",
          error: error.message,
          time: Math.floor(interaction.createdTimestamp / 1000),
        },
        interaction,
      );
    }
  },
};
