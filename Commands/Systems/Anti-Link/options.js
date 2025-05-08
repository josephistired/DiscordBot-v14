const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/links");
const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  subCommand: "link.options",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options } = interaction;

    const discordlinksObject = options.getString("discord-links");

    const onoff = discordlinksObject === "true" ? "On" : "Off";

    try {
      await Database.findOneAndUpdate(
        { Guild: interaction.guild.id },
        {
          discordLinks: discordlinksObject,
        },
        {
          new: true,
          upsert: true,
        },
      );

      const success = new EmbedBuilder()
        .setColor("Green")
        .setDescription("Successfully setup the anti-link system!")
        .addFields({
          name: "🔗 Discord Links:",
          value: onoff,
        })
        .setFooter({ text: "On by default!" });
      interaction.reply({
        embeds: [success],
        ephemeral: true,
      });
    } catch (error) {
      errorSend(
        {
          user: `${interaction.user.username}`,
          command: `${interaction.commandName}`,
          error: error.message,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction,
      );
    }
  },
};
