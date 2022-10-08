const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Displays The Status Of The Bot And Database Connection!"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const status = new EmbedBuilder().setDescription("coming soon");

    interaction.reply({ embeds: [status] });
  },
};
