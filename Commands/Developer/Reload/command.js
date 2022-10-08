const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadAllCommands } = require("../../../Handlers/commandLoader");

module.exports = {
  subCommand: "reload.commands",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    loadAllCommands(client);
    interaction.reply({
      content: "✅ Commands Have Been Reloaded",
      ephemeral: true,
    });
  },
};
