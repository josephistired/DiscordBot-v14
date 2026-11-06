const {
  InteractionContextType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addStringOption((options) =>
      options
        .setName("question")
        .setDescription("Provide the question of the poll.")
        .setRequired(true),
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const pollQuestion = interaction.options.getString("question");

    const attachment = new AttachmentBuilder("assets/poll.gif");

    const pollEmbed = new EmbedBuilder()
      .setDescription(`Question:\n${pollQuestion}`)
      .setImage("attachment://poll.gif")
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .addFields([
        { name: "Yes's", value: "0", inline: true },
        { name: "No's", value: "0", inline: true },
      ])
      .setColor("Green");

    await interaction.reply({
      embeds: [pollEmbed],
    });

    const replyObject = await interaction.fetchReply();

    const pollButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Yes")
        .setCustomId(`Poll-Yes-${replyObject.id}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel("No")
        .setCustomId(`Poll-No-${replyObject.id}`)
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.editReply({
      components: [pollButtons],
      files: [attachment],
    });
  },
};
