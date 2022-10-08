const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const superagent = require("superagent");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("A 8ball That Answers All Your Questions")
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

    let { body } = await superagent.get(
      `https://eightballapi.com/api?question=${question}`
    );

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red");

    if (question.length > 1024)
      errorsArray.push("Question Can't Be More Than 2000 Characters.");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [
          errorEmbed.addFields(
            {
              name: "User:",
              value: `\`\`\`${interaction.user.username}\`\`\``,
            },
            {
              name: "Reason:",
              value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
            }
          ),
        ],
        ephemeral: true,
      });

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
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      })
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
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("8ball Delegator Docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://8ball.delegator.com")
        ),
      ],
    });
  },
};
