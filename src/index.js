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
const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates } =
  GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates],
  partials: [User, Message, GuildMember, ThreadMember],
});

client.config = require("../Configuration/config.json"); // Change back to public folder # Developer Note
client.events = new Collection();
client.subCommands = new Collection();
client.commands = new Collection();

const { loadAllEvents } = require("../Handlers/eventLoader");
loadAllEvents(client);

client.login(client.config.Token);
