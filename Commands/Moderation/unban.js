const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans User From Server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("userid")
        .setDescription("Provide The ID Of The User.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide A Reason For The Unban.")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getString("userid");
    const reason = options.getString("reason") || "Not Specified.";

    try {
      await interaction.guild.members.unban(user);

      const successEmbed = new EmbedBuilder()
        .setTimestamp()
        .setFooter({
          text: "Github -> https://github.com/josephistired",
        })
        .setColor("Green")
        .addFields(
          {
            name: "User Unbanned:",
            value: `\`\`\`${user}\`\`\``,
          },
          {
            name: "Reason:",
            value: `\`\`\`${reason}\`\`\``,
          },
          {
            name: "Moderator:",
            value: `\`\`\`${member.user.username}\`\`\``,
          }
        );
      await interaction.reply({
        embeds: [successEmbed],
      });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("⛔ Error Executing Command")
        .setColor("Red");

      return interaction.reply({
        embeds: [
          errorEmbed.addFields(
            {
              name: "User:",
              value: `\`\`\`${interaction.user.username}\`\`\``,
            },
            {
              name: "Reasons:",
              value: `\`\`\`${err}\`\`\``,
            }
          ),
        ],
        ephemeral: true,
      });
    }
  },
};
