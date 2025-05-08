const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
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
        .setRequired(true),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const question = interaction.options.getString("question");
    const member = interaction.user.username;

    let { body } = await superagent.get(
      `https://eightballapi.com/api?question=${question}`,
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
        interaction,
      );
    }

    try {
      const attachment = new AttachmentBuilder("assets/8ball.jpg");

      const eightballembed = new EmbedBuilder()
        .setTitle("🎱 The Old Mighty 8ball")
        .setDescription(
          `The 8ball has spoken, will you ${interaction.user} trust it?`,
        )
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setThumbnail("attachment://8ball.jpg")
        .setTimestamp()
        .addFields(
          {
            name: "You asked:",
            value: `${question}`,
          },
          {
            name: "The Mighty 8ball says:",
            value: `${body.reading}`,
          },
        )
        .setFooter({ text: `Requested By: ${interaction.user.tag}` });
      interaction.reply({
        embeds: [eightballembed],
        files: [attachment],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "An error occurred! Try again later",
        ephemeral: true,
      });
    }
  },
};
