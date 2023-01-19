const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Database = require("../../../Schemas/giveaway");
const ms = require("ms");

module.exports = {
  subCommand: "giveaway.edit",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options } = interaction;

    const id = options.getString("id");
    const newWinnerCount = options.getInteger("winners");
    const newPrize = options.getString("prize");
    const addTime = options.getString("duration");

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
      client.giveawaysManager.edit(id, {
        addTime: ms(addTime),
        newWinnerCount,
        newPrize,
      });
      await interaction.reply("✅ Success! Giveaway edited!");
    }
  },
};
