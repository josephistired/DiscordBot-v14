const { Message } = require("discord.js");
const { connection } = require("mongoose");

module.exports = {
  name: "messageUpdate",
  /**
   * @param {Message} oldMessage
   * @param {Message} newMessage
   */
  async execute(oldMessage, newMessage) {
    if (oldMessage.author.bot) return;

    if (connection.readyState !== 1) return;

    // have to make sure links are NOT being edited into messages (;

    console.log(
      `${oldMessage.author.username} - ${oldMessage.content} -> ${newMessage.content}`
    ); //testing
  },
};
