const { Events, EmbedBuilder, MessageFlags } = require("discord.js");
const { pending } = require("../../Functions/pollState");
const { recordVote } = require("../../Functions/polls");
module.exports = {
  name: Events.InteractionCreate,
  async execute(i) {
    if (!i.isButton() || !i.customId.startsWith("Poll-")) return;
    const [, answer, messageId] = i.customId.split("-");
    if (
      !["Yes", "No"].includes(answer) ||
      messageId !== i.message.id ||
      !i.guildId
    )
      return;
    await i.deferReply({ flags: MessageFlags.Ephemeral });
    const previous = pending.get(messageId) ?? Promise.resolve();
    const task = previous
      .catch(() => {})
      .then(async () => {
        const message = await i.message.fetch();
        if (message.author.id !== i.client.user.id || !message.embeds[0])
          return i.editReply("This poll is unavailable.");
        const embed = EmbedBuilder.from(message.embeds[0]);
        const fields = embed.data.fields;
        if (
          !fields?.[1] ||
          !fields
            .slice(0, 2)
            .every(
              (f) =>
                /^\d+$/.test(f.value) && Number.isSafeInteger(Number(f.value)),
            )
        )
          return i.editReply("This poll is invalid.");
        const { counted, poll } = await recordVote(
          i.guildId,
          messageId,
          i.user.id,
          answer,
          { yes: Number(fields[0].value), no: Number(fields[1].value) },
        );
        // Also refresh the presentation of polls created before this update.
        embed.setColor("Blurple").setTitle("📊 Poll").setImage(null);
        fields[0].name = "✅ Yes";
        fields[1].name = "❌ No";
        fields[0].value = String(poll.yes);
        fields[1].value = String(poll.no);
        // Persistent totals are authoritative; a retry repairs an edit that failed after recording the vote.
        await message.edit({ embeds: [embed], attachments: [] });
        await i.editReply(
          counted
            ? "Your vote has been recorded."
            : "You have already voted. Your vote remains recorded.",
        );
      });
    pending.set(messageId, task);
    try {
      await task;
    } catch (error) {
      console.error("Poll vote failed:", error);
      await i.editReply(
        "The poll could not be refreshed. Please try again; a recorded vote will not be counted twice.",
      );
    } finally {
      if (pending.get(messageId) === task) pending.delete(messageId);
    }
  },
};
