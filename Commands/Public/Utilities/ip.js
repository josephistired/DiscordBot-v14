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
    .setDescription("Displays Info About Given IP")
    .addStringOption((options) =>
      options.setName("ip").setDescription("What's The IP?").setRequired(true)
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
      .setTitle("⛔ Error Executing Command")
      .setColor("Red")
      .setFooter({ text: "https://github.com/josephistired" })
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
      .setTitle(`Here's Your Info On **${ip}**!`)
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
          name: "Type Of IP:",
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
            .setLabel("IPWHOIS Docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://ipwhois.io/documentation")
        ),
      ],
    });
  },
};
