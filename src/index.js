require("dotenv").config();

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const { Collection } = require("discord.js");
const client = require("./discordClient");
const GiveawayManagerWithOwnDatabase = require("./giveawayManager");

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
loadEvents(client);

client.login(process.env.TOKEN);
