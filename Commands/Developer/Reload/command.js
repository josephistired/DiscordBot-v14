const { MessageFlags } = require("discord.js");
const { loadCommands } = require("../../../Handlers/commandLoader");

module.exports = {
  subCommand: "reload.commands",
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await loadCommands(client);
    await interaction.editReply("✅ Commands have been reloaded.");
  },
};
