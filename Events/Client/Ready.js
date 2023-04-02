console.clear();

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

require("dotenv").config();

const { loadCommands } = require("../../Handlers/commandLoader");
const { logSchemas } = require("../../Handlers/schemaLoader");

async function connectDatabases() {
  await mongoose.connect(process.env.DATABASEURL);
  await require("simply-xp").connect(process.env.DATABASEURL, {
    notify: false,
  });
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.user.setActivity(`${client.guilds.cache.size} Guilds`);

    loadCommands(client);
    logSchemas();

    await connectDatabases();
  },
};
