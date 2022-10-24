const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadAllEvents } = require("../../../Handlers/eventLoader");

module.exports = {
  subCommand: "reload.events",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    for (const [key, value] of client.events)
      client.removeListener(`${key}`, value, true);
    loadAllEvents(client);
    interaction.reply({
      content: "✅ Events Have Been Reloaded",
      ephemeral: true,
    });
  },
};
