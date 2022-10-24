const { Message } = require("discord.js");
const { connection } = require("mongoose");
const xp = require("simply-xp");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   */
  execute(message, client) {
    if (message.author.bot) return;

    if (connection == 0) return;

    xp.addXP(message, message.author.id, message.guild.id, {
      min: 50,
      max: 2,
    });
  },
};
