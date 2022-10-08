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
    .setName("wink")
    .setDescription("Wink At Another User")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select The User.")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    let { body } = await superagent.get(
      `https://some-random-api.ml/animu/wink`
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;
    await user.fetch();

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red");

    if (user.id === interaction.member.id)
      errorsArray.push("Winking At Yourself... Is Kinda Weird....");

    if (body.error == true) errorsArray.push(`${body.message}`);

    if (errorsArray.length)
      return interaction.reply({
        embeds: [
          errorEmbed.addFields(
            {
              name: "User:",
              value: `\`\`\`${interaction.user.username}\`\`\``,
            },
            {
              name: "Reasons:",
              value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
            }
          ),
        ],
        ephemeral: true,
      });

    const winkembed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .setColor("Green")
      .setImage(
        `${body.link}
    `
      )
      .setTimestamp()
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      });

    interaction.reply({
      content: `${member} Winks At ${user}`,
      embeds: [winkembed],
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Some Random Api Docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://some-random-api.ml")
        ),
      ],
    });
  },
};
