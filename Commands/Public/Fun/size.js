const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("size")
    .setDescription("Displays 8====D Size Of Another User")
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select The User.")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction) {
    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const list = [
      "8=D",
      "8==D",
      "8===D",
      "8====D",
      "8=====D",
      "8======D",
      "8========D",
      "8=========D",
      "8==========D",
      "8===========D",
      "8============D",
      "8=============D",
    ];

    const size = list[Math.floor(Math.random() * list.length)];

    const sizeembed = new EmbedBuilder()
      .setTitle(`Penis Size :speaking_head:`)
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.member.displayAvatarURL()}`,
      })
      .setTimestamp()
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      })
      .addFields({
        name: "Size",
        value: `${user}\'s penis size\n${(list, size)}`,
      });

    interaction.reply({
      embeds: [sizeembed],
    });
  },
};
