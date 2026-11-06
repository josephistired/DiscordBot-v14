const {
  InteractionContextType,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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
        .setMaxLength(3500)
        .setDescription("Provide the question of the poll.")
        .setRequired(true),
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const pollQuestion = interaction.options.getString("question");

    const pollEmbed = new EmbedBuilder()
      .setTitle("📊 Poll")
      .setDescription(pollQuestion)
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .addFields([
        { name: "✅ Yes", value: "0", inline: true },
        { name: "❌ No", value: "0", inline: true },
      ])
      .setColor("Blurple");

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
    });
  },
};
