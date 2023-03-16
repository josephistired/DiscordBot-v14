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
    .setName("ip")
    .setDescription("Displays information about a given IP address")
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("ip")
        .setDescription("What is the IP address? ")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const ip = interaction.options.getString("ip");

    let { body } = await superagent.get(`https://ipwhois.app/json/${ip}`);

    const country = body.country_code;

    const error = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setFooter({ text: "https://github.com/josephistired" })
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif")
      .addFields(
        {
          name: "User:",
          value: `\`\`\`${interaction.user.username}\`\`\``,
        },
        {
          name: "Reason:",
          value: `\`\`\`${body.message}\`\`\``,
        }
      );

    if (body.success == false)
      return interaction.reply({
        embeds: [error],
        ephemeral: true,
      });

    const ipembed = new EmbedBuilder()
      .setTitle(`Here is some information for you on **${ip}**!`)
      .setTimestamp()
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      })
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      })
      .setColor("Green")
      .addFields(
        {
          name: "Type of IP:",
          value: `\`\`\`${body.type}\`\`\``,
        },
        {
          name: "Continent:",
          value: `\`\`\`${body.continent}\`\`\``,
        },
        {
          name: "Country:",
          value: `\`\`\`${body.country}\`\`\``,
        },
        {
          name: "State:",
          value: `\`\`\`${body.region}\`\`\``,
        },
        {
          name: "City:",
          value: `\`\`\`${body.city}\`\`\``,
        },
        {
          name: "Timezone:",
          value: `\`\`\`${body.timezone_name}\`\`\``,
        },
        {
          name: "ISP:",
          value: `\`\`\`${body.isp}\`\`\``,
        },
        {
          name: "Flag:",
          value: `:flag_${country}:`.toLocaleLowerCase(),
        }
      );
    interaction.reply({
      embeds: [ipembed],
      ephemeral: true,
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("IPWHOIS docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://ipwhois.io/documentation")
        ),
      ],
    });
  },
};
