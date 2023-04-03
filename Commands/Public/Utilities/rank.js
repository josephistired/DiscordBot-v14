const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const xp = require("simply-xp");
const { connection } = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Displays user's rank")
    .setDMPermission(false)
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getMember("user") || interaction.member;

    xp.rank(interaction, user.id, interaction.guild.id, {
      background:
        "https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569__480.jpg",
      color: "#ff3c33",
      lvlbar: "#ff3c33",
      lvlbarBg: "3361ff",
    }).then(async (img) => {
      await interaction.followUp({ files: [img] });
    });
  },
};
