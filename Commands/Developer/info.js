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
    .setDescription("Shows information on the bot.")
    .setDMPermission(false),

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
        "A Multi-Purpose bot based off josephistired's Github project."
      )
      .setTimestamp()
      .addFields({
        name: "Developer's discord",
        value: `\`\`\`josephistired#5678\`\`\``,
      });
    interaction.reply({
      embeds: [infoembed],
      ephemeral: true,
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Project's Github")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/josephistired/DiscordBot-v14")
        ),
      ],
    });
  },
};
