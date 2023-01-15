const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans user from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption((options) =>
      options
        .setName("userid")
        .setDescription("Please enter the user's ID.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for the unban of this user?")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getString("userid");
    const reason = options.getString("reason") || "Not specified";

    const logChannel = interaction.guild.channels.cache.get(""); // CHANGE TO YOUR LOGGING CHANNEL

    try {
      await interaction.guild.members.unban(user);

      const successEmbed = new EmbedBuilder().setColor("Green");
      const logEmbed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: "⌀ Unban Command Executed!" })
        .setTimestamp()
        .addFields(
          {
            name: "👤 User:",
            value: `\`\`\`${user}\`\`\``,
          },
          {
            name: "❔ Reason:",
            value: `\`\`\`${reason}\`\`\``,
          },
          {
            name: "👮🏻 Moderator:",
            value: `\`\`\`${member.user.username}\`\`\``,
          }
        );

      await interaction.reply({
        embeds: [
          successEmbed.setDescription(
            ` \n ⌀ Unbanned \`${user}\` from the server!`
          ),
        ],
        ephemeral: true,
      }),
        logChannel.send({
          embeds: [logEmbed],
        });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("⛔ Error executing command")
        .setColor("Red")
        .setImage(
          "https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif"
        );

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
