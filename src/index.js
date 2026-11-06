require("dotenv").config();

const { Collection } = require("discord.js");
const client = require("./discordClient");
const GiveawayManagerWithOwnDatabase = require("./giveawayManager");

async function start() {
  for (const key of ["TOKEN", "DATABASEURL", "DEVELOPERID"]) {
    if (!process.env[key]?.trim()) throw new Error(`Missing required environment variable: ${key}`);
  }
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.DATABASEURL);

  const manager = new GiveawayManagerWithOwnDatabase(client, {
    default: {
      botsCanWin: false,
      embedColor: "#00FF00",
      embedColorEnd: "#FF0000",
      reaction: "🎉",
    },
  });

  client.giveawaysManager = manager;
  client.events = new Collection();
  client.subCommands = new Collection();
  client.commands = new Collection();
  client.cooldowns = new Collection();

  const { loadEvents } = require("../Handlers/eventLoader");
  await loadEvents(client);

  await client.login(process.env.TOKEN);

}

start().catch(async (error) => {
  console.error("Bot startup failed:", error);
  client.destroy();
  await require("mongoose").disconnect();
  process.exitCode = 1;
});
