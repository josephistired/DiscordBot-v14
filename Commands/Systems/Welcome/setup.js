const { EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const Database = require("../../../Schemas/welcome");

module.exports = {
  subCommand: "welcome.setup",
  /**
   * @param {ChatInputCommandInteraction} interaction
   *
   */
  async execute(interaction) {
    const { options } = interaction;

    const channelObject = options.getChannel("welcome-channel");
    const roleObject = options.getRole("welcome-role");
    const messageObject = options.getString("welcome-message");
    const colorObject = options.getString("welcome-color");

    await Database.findOneAndUpdate(
      { Guild: interaction.guild.id },
      {
        welcomeChannel: channelObject.id,
        welcomeMessage: messageObject,
        welcomeColor: colorObject,
        welcomeRole: roleObject.id,
      },
      {
        new: true,
        upsert: true,
      },
    );

    const success = new EmbedBuilder()
      .setColor("Green")
      .setDescription("Successfully setup the welcome system!")
      .addFields({
        name: "Channel:",
        value: channelObject.name,
      });

    interaction.reply({
      embeds: [success],
      ephemeral: true,
    });
  },
};
