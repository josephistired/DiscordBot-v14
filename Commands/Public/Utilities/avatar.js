const {
  InteractionContextType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
module.exports = {
  requiresDatabase: false,
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Displays your or another user's avatar")
    .setContexts(InteractionContextType.Guild)
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user."),
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const selected = interaction.options.getUser("user") ?? interaction.user;
    const member =
      interaction.options.getMember("user") ??
      (selected.id === interaction.user.id ? interaction.member : null);
    const user = member ?? selected;
    const x64 = user.displayAvatarURL({ size: 64 });
    const x256 = user.displayAvatarURL({ size: 256 });
    const x512 = user.displayAvatarURL({ size: 512 });
    const x2048 = user.displayAvatarURL({ size: 2048 });
    const x4096 = user.displayAvatarURL({ size: 4096 });

    const avatar = new EmbedBuilder()
      .setTitle(`👤 ${user.displayName}'s Avatar`)
      .setDescription(
        `Here are ${user.displayName}'s avatars in different sizes:`,
      )
      .setColor("Green")
      .setImage(x4096)
      .setTimestamp()
      .addFields(
        {
          name: "x64",
          value: `[x64](${x64})`,
        },
        {
          name: "x256",
          value: `[x256](${x256})`,
        },
        {
          name: "x512",
          value: `[x512](${x512})`,
        },
        {
          name: "x2048",
          value: `[x2048](${x2048})`,
        },
        {
          name: "x4096",
          value: `[x4096](${x4096})`,
        },
      )
      .setFooter({ text: `Requested By: ${interaction.user.tag}` });

    await interaction.reply({
      embeds: [avatar],
    });
  },
};
