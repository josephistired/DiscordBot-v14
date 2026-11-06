const { Events } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandLoader");
const { logSchemas } = require("../../Handlers/schemaLoader");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    client.user.setActivity(`${client.guilds.cache.size} Guilds`);
    await loadCommands(client);
    logSchemas();
  },
};
