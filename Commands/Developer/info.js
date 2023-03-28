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
    .setDescription("Shows information on the bot."),

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
        "A Multi-Purpose bot based off josephistired's Github project. If you want more information click the buttons below."
      )
      .setTimestamp()
      .addFields(
        {
          name: "Developer's discord",
          value: `\`\`\`josephistired#5678\`\`\``,
        },
        {
          name: "Discord.js",
          value: `\`\`\`This bot Is based on Discord.js v14\`\`\``,
        }
      );
    await interaction.reply({
      embeds: [infoembed],
      ephemeral: true,
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Project's Github")
            .setStyle(ButtonStyle.Link)
            .setURL("https://github.com/josephistired/DiscordBot-v14"),

          new ButtonBuilder()
            .setLabel("Discord.js docs")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.js.org/#/docs")
        ),
      ],
    });
  },
};
