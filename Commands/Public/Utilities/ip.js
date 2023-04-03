const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");

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

    const errorsArray = [];

    if (body.success === false) {
      errorsArray.push(`${body.message}`);
    }

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${interaction.member.user}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction
      );
    }

    function getFlagEmoji(countryCode) {
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    }

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
          value: `\`\`\`${getFlagEmoji(body.country_code)}\`\`\``,
        }
      );
    interaction.reply({
      embeds: [ipembed],
      ephemeral: true,
    });
  },
};
