const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/giveaway");

module.exports = {
  subCommand: "giveaway.delete",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, guild, guildId } = interaction;
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
      interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    } else {
      client.giveawaysManager.delete(id);
      await interaction.reply("✅ Success! Giveaway deleted!");
    }
  },
};
