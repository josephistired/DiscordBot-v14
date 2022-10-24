// GNU General Public License v3.0 - https://www.gnu.org/licenses/gpl-3.0.en.html
// You must not delete this command nor alter this command.

const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Displays Information On Bot"),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const infoembed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .setDescription(
        "A Multi-Purpose Bot Based Off josephistired's Github Project. If You Want More Information Click The Buttons Below."
      )
      .setTimestamp()
      .addFields(
        {
          name: "Developer's Discord",
          value: `\`\`\`josephistired#5678\`\`\``,
        },
        {
          name: "Discord.js",
          value: `\`\`\`This Bot Is Based On Discord.js v14\`\`\``,
        }
      );
    interaction.reply({
      embeds: [infoembed],
      ephemeral: true,
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Project's Github")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/josephistired"),

          new ButtonBuilder()
            .setLabel("Discord.js Docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.js.org/#/docs")
        ),
      ],
    });
  },
};
