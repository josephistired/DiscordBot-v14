const { loadEvents } = require("../../../Handlers/eventLoader");

module.exports = {
  subCommand: "reload.events",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await loadEvents(client);
    await interaction.editReply("✅ Events have been reloaded.");
  },
};
