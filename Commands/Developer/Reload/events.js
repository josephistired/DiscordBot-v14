const { MessageFlags } = require("discord.js");
const { loadEvents } = require("../../../Handlers/eventLoader");

module.exports = {
  subCommand: "reload.events",
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await loadEvents(client);
    await interaction.editReply("✅ Events have been reloaded.");
  },
};
