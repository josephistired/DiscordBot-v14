const mongoose = require("mongoose"); // Testing Purposes
mongoose.set("strictQuery", false); // Testing Purposes

console.clear(); // Testing Purposes

process.on("unhandledRejection", (error) => {
  console.error(error);
}); // Logging Errors

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const {
  Guilds,
  GuildMembers,
  GuildMessages,
  GuildVoiceStates,
  GuildMessageReactions,
} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildVoiceStates,
    GuildMessageReactions,
  ],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { GiveawaysManager } = require("discord-giveaways");
const manager = new GiveawaysManager(client, {
  storage: "../Data/giveawaydata.json",
  default: {
    botsCanWin: false,
    embedColor: "#00FF00",
    embedColorEnd: "#FF0000",
    reaction: "🎉",
  },
});

client.giveawaysManager = manager;
client.config = require("../Development Test/config.json");
client.events = new Collection();
client.subCommands = new Collection();
client.commands = new Collection();

const { loadAllEvents } = require("../Handlers/eventLoader");
loadAllEvents(client);

client.login(client.config.Token);
