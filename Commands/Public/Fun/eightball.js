const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("A magic 8-Ball that answers all of your questions")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("question")
        .setDescription("What's the Question?")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const question = interaction.options.getString("question");
    const member = interaction.user.username;

    let { body } = await superagent.get(
      `https://eightballapi.com/api?question=${question}`
    );

    const errorsArray = [];

    if (question.length > 1024)
      errorsArray.push("The question cannot exceed 2000 characters.");

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction
      );
    }

    const eightballembed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .setImage(
        "https://media.istockphoto.com/vectors/billiard-black-eight-vector-id614744860?k=20&m=614744860&s=612x612&w=0&h=hl4EtO9_2oEzndtohCGqwUt6sxtxlvUHyhJlZ2YvVRk="
      )
      .setColor("Green")
      .setTimestamp()
      .addFields(
        {
          name: "Question:",
          value: `\`\`\`${question}\`\`\``,
        },
        {
          name: "Answer:",
          value: `\`\`\`${body.reading}\`\`\``,
        }
      );
    interaction.reply({
      embeds: [eightballembed],
    });
  },
};
