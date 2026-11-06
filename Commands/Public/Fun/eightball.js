const {
  SlashCommandBuilder,
  InteractionContextType,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("A magic 8-Ball that answers all of your questions")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("What's the question?")
        .setMaxLength(1024)
        .setRequired(true),
    ),
  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    await interaction.deferReply();
    const { body } = await superagent
      .get("https://eightballapi.com/api")
      .query({ question })
      .timeout({ response: 5000, deadline: 10000 });
    if (typeof body.reading !== "string" || !body.reading)
      throw new Error("Invalid 8ball response");
    const embed = new EmbedBuilder()
      .setTitle("🎱 The Mighty 8ball")
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .addFields(
        { name: "You asked:", value: question },
        { name: "The Mighty 8ball says:", value: body.reading.slice(0, 1024) },
      )
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};
