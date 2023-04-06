console.clear();

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

require("dotenv").config();

const { loadCommands } = require("../../Handlers/commandLoader");
const { logSchemas } = require("../../Handlers/schemaLoader");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.user.setActivity(`${client.guilds.cache.size} Guilds`);

    loadCommands(client);
    logSchemas();

    await mongoose.connect(process.env.DATABASEURL);
  },
};
