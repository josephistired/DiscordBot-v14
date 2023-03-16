const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Displays your or another user's avatar")
    .setDMPermission(false)
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user.")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const user = interaction.options.getMember("user") || interaction.member;
    await user.user.fetch();

    const avatar = new EmbedBuilder()
      .setColor("Green")
      .setImage(
        user.user.displayAvatarURL({
          dynamic: true,
          size: 2048,
        })
      )
      .setTimestamp()
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      })
      .addFields(
        {
          name: "User:",
          value: `\`\`\`${user.user.username}\`\`\``,
        },
        {
          name: "Requested By:",
          value: `\`\`\`${interaction.user.username}\`\`\``,
        }
      );

    interaction.reply({
      embeds: [avatar],
    });
  },
};
