const { Events, EmbedBuilder, MessageFlags } = require("discord.js");
const { votes, pending } = require("../../Functions/pollState");
const MAX_POLLS = 1000;

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton() || !interaction.customId.startsWith("Poll-"))
      return;
    const [, answer, messageId] = interaction.customId.split("-");
    if (!["Yes", "No"].includes(answer) || messageId !== interaction.message.id)
      return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const previous = pending.get(messageId) ?? Promise.resolve();
    const task = previous
      .catch(() => {})
      .then(async () => {
        if (!votes.has(messageId)) {
          if (votes.size >= MAX_POLLS) votes.delete(votes.keys().next().value);
          votes.set(messageId, new Set());
        }
        const voters = votes.get(messageId);
        if (voters.has(interaction.user.id))
          return interaction.editReply("You have already voted.");
        const message = await interaction.message.fetch();
        if (
          message.author.id !== interaction.client.user.id ||
          !message.embeds[0]
        ) {
          return interaction.editReply("This poll is unavailable.");
        }
        const embed = EmbedBuilder.from(message.embeds[0]);
        const index = answer === "Yes" ? 0 : 1;
        const field = embed.data.fields?.[index];
        if (!field || !/^\d+$/.test(field.value))
          return interaction.editReply("This poll is invalid.");
        field.value = String(Number(field.value) + 1);
        await message.edit({ embeds: [embed] });
        voters.add(interaction.user.id);
        await interaction.editReply("Your vote has been recorded.");
      });
    pending.set(messageId, task);
    try {
      await task;
    } finally {
      if (pending.get(messageId) === task) pending.delete(messageId);
    }
  },
};
