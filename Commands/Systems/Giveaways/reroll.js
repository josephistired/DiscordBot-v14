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

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    let giveawayData = await Database.findOne({
      guildId: interaction.guildId,
      messageId: id,
    });
    if (!giveawayData) {
      errorsArray.push(
        `\`\`\`There were no giveaways found with the provided message ID. - ${id}\`\`\``
      );

      interaction.reply({
        embeds: [
          errorEmbed.addFields({
            name: "Reasons:",
            value: `${errorsArray.join("\n")}`,
          }),
        ],
        ephemeral: true,
      });
    } else if (!giveawayData.ended) {
      errorsArray.push(
        `\`\`\`The giveaway with message Id ${id} discovered has not ended. \`\`\``
      );

      interaction.reply({
        embeds: [
          errorEmbed.addFields({
            name: "Reasons:",
            value: `${errorsArray.join("\n")}`,
          }),
        ],
        ephemeral: true,
      });
    } else {
      client.giveawaysManager.reroll(id);
      await interaction.reply("✅ Success! Giveaway rerolled!");
    }
  },
};
