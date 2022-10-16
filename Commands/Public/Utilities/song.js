const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const lyricsFinder = require("lyrics-finder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Displays Lyrics Of A Song")
    .addStringOption((options) =>
      options
        .setName("song")
        .setDescription("What's The Song?")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("artist")
        .setDescription("Who Is The Artist Of This Song?")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const song = interaction.options.getString("song");
    const artist = interaction.options.getString("artist");

    const errorembed = new EmbedBuilder()
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
          value: `\`\`\`Song Not Found! Try Again.\`\`\``,
        }
      );

    let lyrics =
      (await lyricsFinder(song, artist)) ||
      interaction.reply({ embeds: [errorembed] });

    const lyricsembed = new EmbedBuilder()
      .setDescription(lyrics)
      .setTitle(`Here's Your Lyrics For **${song}**!`)
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
          name: "Artist:",
          value: `\`\`\`${artist}\`\`\``,
        },
        {
          name: "Song:",
          value: `\`\`\`${song}\`\`\``,
        }
      );
    interaction.reply({
      embeds: [lyricsembed],
      ephemeral: false, // Everyone can see this embed, change this to true if you don't want that.
      components: [
        new ActionRowBuilder().setComponents(
          new ButtonBuilder()
            .setLabel("Lyrics-Finder")
            .setStyle(ButtonStyle.Link)
            .setURL("https://www.npmjs.com/package/lyrics-finder")
        ),
      ],
    });
  },
};
