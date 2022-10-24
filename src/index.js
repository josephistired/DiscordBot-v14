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

// const { DisTube } = require("distube");
// const { SpotifyPlugin } = require("@distube/spotify");

// client.distube = new DisTube(client, {
// emitNewSongOnly: true,                                       // TESTING PURPOSES DON'T TOUCH
//leaveOnFinish: true,
// emitAddSongWhenCreatingQueue: false,
// plugins: [new SpotifyPlugin()],
// });
//module.exports = client;

client.config = require("../Development Test/config.json"); // Change back to public folder # Developer Note
client.events = new Collection();
client.subCommands = new Collection();
client.commands = new Collection();

const { loadAllEvents } = require("../Handlers/eventLoader");
loadAllEvents(client);

client.login(client.config.Token);
