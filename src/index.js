require("dotenv").config();

process.on("unhandledRejection", (error) => {
  console.error(error);
}); 

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

const giveawayModel = require("../Schemas/giveaway");

const { GiveawaysManager } = require("discord-giveaways");
const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
  async getAllGiveaways() {
    return await giveawayModel.find().lean().exec();
  }

  async saveGiveaway(messageId, giveawayData) {
    await giveawayModel.create(giveawayData);

    return true;
  }

  async editGiveaway(messageId, giveawayData) {
    await giveawayModel.updateOne({ messageId }, giveawayData).exec();

    return true;
  }

  async deleteGiveaway(messageId) {
    await giveawayModel.deleteOne({ messageId }).exec();

    return true;
  }
};

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

const { loadAllEvents } = require("../Handlers/eventLoader");
loadAllEvents(client);

client.login(process.env.TOKEN);
