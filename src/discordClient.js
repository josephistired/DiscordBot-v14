const { Client, GatewayIntentBits, Partials } = require("discord.js");
const {
  Guilds,
  GuildMembers,
  GuildMessages,
  GuildVoiceStates,
  GuildMessageReactions,
  GuildModeration,
  GuildInvites,
  GuildExpressions,
  MessageContent,
} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel, Reaction } =
  Partials;

const client = new Client({
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildVoiceStates,
    GuildMessageReactions,
    GuildModeration,
    GuildInvites,
    GuildExpressions,
    MessageContent,
  ],
  partials: [User, Message, GuildMember, ThreadMember, Channel, Reaction],
});

module.exports = client;
