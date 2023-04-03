const { ButtonInteraction } = require("discord.js");

const votedMembers = new Set();

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const splittedArray = interaction.customId.split("-");
    if (splittedArray[0] !== "Poll") return;

    if (votedMembers.has(`${interaction.user.id}-${interaction.message.id}`))
      return interaction.reply({
        content: "You have already voted.",
        ephemeral: true,
      });

    votedMembers.add(`${interaction.user.id}-${interaction.message.id}`);

    const pollEmbed = interaction.message.embeds[0];
    if (!pollEmbed)
      return interaction.reply({
        content: "Contact the hoster of this bot. Unable to find the embed.",
        ephemeral: true,
      });

    const yesField = pollEmbed.fields[0];
    const noField = pollEmbed.fields[1];

    const VoteCoutedReply = "Your vote had been recorded.";

    switch (splittedArray[1]) {
      case "Yes":
        const newYesCount = parseInt(yesField.value) + 1;
        yesField.value = newYesCount;

        await interaction.reply({ content: VoteCoutedReply, ephemeral: true });
        await interaction.message.edit({ embeds: [pollEmbed] });

        break;
      case "No":
        const newNoCount = parseInt(noField.value) + 1;
        noField.value = newNoCount;

        interaction.reply({ content: VoteCoutedReply, ephemeral: true });
        interaction.message.edit({ embeds: [pollEmbed] });

        break;
      default:
        // Do nothing
        break;
    }
  },
};
