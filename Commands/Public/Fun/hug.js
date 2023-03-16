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
    .setName("hug")
    .setDescription("Hug another user")
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    let { body } = await superagent.get(
      `https://purrbot.site/api/img/sfw/hug/gif`
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;
    await user.fetch();

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    if (user.id === interaction.member.id)
      errorsArray.push(
        "You must be extremely lonely to try and hug yourself. I'll save you from embarrassment."
      );

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

    const hugembed = new EmbedBuilder()
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
      content: `${member} Hugs ${user}`,
      embeds: [hugembed],
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Purrbot docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://docs.purrbot.site/api/")
        ),
      ],
    });
  },
};
