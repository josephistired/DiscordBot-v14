const {
  MessageFlags,
  InteractionContextType,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Transcript = require("discord-html-transcripts");

const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Deletes messages in the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts(InteractionContextType.Guild)
    .addIntegerOption((options) =>
      options
        .setName("amount")
        .setDescription("Enter the number of messages you want to delete.")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for purging the messages?")
        .setRequired(true),
    )
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user."),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount", true);
    const reason = interaction.options.getString("reason", true);
    const user = interaction.options.getUser("user");
    const channel = interaction.channel;
    if (!channel?.isTextBased() || typeof channel.bulkDelete !== "function") {
      throw new Error("This channel does not support bulk message deletion.");
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const fetched = await channel.messages.fetch({ limit: 100 });
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const selected = fetched.filter(
      (message) =>
        message.createdTimestamp > cutoff &&
        (!user || message.author.id === user.id),
    );
    const messages = selected.first(amount);
    if (!messages.length)
      return interaction.editReply(
        "No matching messages younger than 14 days were found.",
      );
    const transcript = await Transcript.generateFromMessages(messages, channel);
    const deleted = await channel.bulkDelete(messages, true);
    await interaction.editReply(
      `Purged ${deleted.size} messages${user ? ` from ${user.tag}` : ""}.`,
    );
    await moderationlogSend(
      {
        action: "Purge",
        moderator: interaction.user.tag,
        user: user?.tag ?? "Everyone",
        reason,
        place: channel.name,
        size: String(deleted.size),
        transcript,
      },
      interaction,
    );
  },
};
