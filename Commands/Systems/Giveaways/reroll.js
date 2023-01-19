const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/giveaway");

module.exports = {
  subCommand: "giveaway.reroll",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options } = interaction;

    const id = options.getString("id");

    const errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("An error has occurred, please check and try again.")
      .addFields({
        name: "Error:",
        value: `\`\`\`No giveaway found with message Id ${id}\`\`\``,
      });

    let giveawayData = await Database.findOne({
      guildId: interaction.guildId,
      messageId: id,
    });
    if (!giveawayData) {
      // also need to add to check if the giveaway is ended or not.
      interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    } else {
      client.giveawaysManager.reroll(id);
      await interaction.reply("✅ Success! Giveaway rerolled!");
    }
  },
};
