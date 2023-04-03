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

  async execute(interaction) {
    const infoEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .setDescription(
        "A multi-purpose bot based off josephistired's Github project."
      )
      .setTimestamp()
      .addFields({
        name: "Developer's Discord",
        value: `\`\`\`josephistired#5678\`\`\``,
      });

    const githubButton = new ButtonBuilder()
      .setLabel("Project's Github")
      .setStyle(ButtonStyle.Link)
      .setURL("https://github.com/josephistired/DiscordBot-v14");

    const actionRow = new ActionRowBuilder().addComponents(githubButton);

    interaction.reply({
      embeds: [infoEmbed],
      components: [actionRow],
      ephemeral: true,
    });
  },
};
