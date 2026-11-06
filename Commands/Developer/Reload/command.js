const { loadCommands } = require("../../../Handlers/commandLoader");

module.exports = {
  subCommand: "reload.commands",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await loadCommands(client);
    await interaction.editReply("✅ Commands have been reloaded.");
  },
};
