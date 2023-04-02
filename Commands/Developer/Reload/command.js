const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadCommands } = require("../../../Handlers/commandLoader");

module.exports = {
  subCommand: "reload.commands",
  /**
   *
   * @param {ChatInputCommandInteraction} commandInteraction
   * @param {Client} discordClient
   */
  async execute(commandInteraction, discordClient) {
    try {
      await loadCommands(discordClient);
      commandInteraction.reply({
        content: "✅ Commands have been reloaded.",
        ephemeral: true,
      });
      console.log("Commands reloaded successfully.");
    } catch (error) {
      console.error("Failed to reload commands:", error);
      commandInteraction.reply({
        content: "❌ Failed to reload commands.",
        ephemeral: true,
      });
    }
  },
};
