const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadEvents } = require("../../../Handlers/eventLoader");

module.exports = {
  subCommand: "reload.events",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    try {
      const eventsToReload = client.eventNames();
      eventsToReload.forEach((eventName) => {
        const eventHandler = client.listeners(eventName)[0];
        if (eventHandler) {
          client.off(eventName, eventHandler);
        }
      });
      loadEvents(client);
      interaction.reply({
        content: "✅ Events have been reloaded.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Failed to reload events:", error);
      interaction.reply({
        content: "❌ Failed to reload events.",
        ephemeral: true,
      });
    }
  },
};
