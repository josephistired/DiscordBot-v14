const { MessageFlags, ChatInputCommandInteraction } = require("discord.js");
const ms = require("ms");

module.exports = {
  subCommand: "giveaway.start",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const { options } = interaction;

    const duration = options.getString("duration");
    const winnerCount = options.getInteger("winners");
    const prize = options.getString("prize");

    const durationMs = ms(duration);
    if (!Number.isFinite(durationMs) || durationMs <= 0 || winnerCount < 1) {
      throw new Error("Provide a positive duration and at least one winner.");
    }
    await client.giveawaysManager.start(interaction.channel, {
      duration: durationMs,
      winnerCount,
      prize,
      hostedBy: interaction.user,
      thumbnail: interaction.user.displayAvatarURL(),
    });
    await interaction.editReply("✅ Giveaway started.");
  },
};
