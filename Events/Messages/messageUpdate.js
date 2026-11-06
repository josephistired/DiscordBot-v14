const { Events } = require("discord.js");
const { enforceAntiLink } = require("../../Functions/antiLink");
module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (oldMessage.content === newMessage.content) return;
    await enforceAntiLink(newMessage);
  },
};
