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
    .setName("slap")
    .setDescription("Slap Another User")
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
      `https://purrbot.site/api/img/sfw/slap/gif`
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;
    await user.fetch();

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red");

    if (user.id === interaction.member.id)
      errorsArray.push("Slapping Yourself... Is Kinda Weird....");

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

    const slapembed = new EmbedBuilder()
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
      content: `${member} Slaps ${user}`,
      embeds: [slapembed],
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Purrbot Docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://docs.purrbot.site/api/")
        ),
      ],
    });
  },
};
