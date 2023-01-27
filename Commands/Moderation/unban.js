const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const { logSend } = require("../../Functions/logSend");

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
  async execute(interaction, client) {
    const { options, member } = interaction;

    const userid = options.getString("userid");
    const reason = options.getString("reason") || "Not specified";

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    const bannedUser = await interaction.guild.bans.fetch();
    const user = bannedUser.get(userid);

    if (!user) errorsArray.push("That user is not banned.");

    if (errorsArray.length)
      return interaction.reply({
        embeds: [
          errorEmbed.addFields(
            {
              name: "User:",
              value: `\`\`\`${interaction.user.username}\`\`\``,
            },
            {
              name: "Reasons:",
              value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
            }
          ),
        ],
        ephemeral: true,
      });

    await interaction.guild.members.unban(userid);

    const successEmbed = new EmbedBuilder().setColor("Green");

    await interaction.reply({
      embeds: [
        successEmbed.setDescription(
          `🔀 \n Unbanned \`${userid}\` from the server!`
        ),
      ],
      ephemeral: true,
    }),
      logSend(
        {
          action: "Unban",
          moderator: `${member.user.username}`,
          user: `${userid}`,
          reason: `${reason}`,
          emoji: "🔀",
        },
        interaction
      );
  },
};
