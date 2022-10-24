const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans User From Server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select The User.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide A Reason For The Ban.")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const reason = options.getString("reason") || "Not Specified.";

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    if (!user)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription("User Has Most Likely Left The Server."),
        ],
        ephemeral: true,
      });

    if (!user.manageable || !user.moderatable)
      errorsArray.push("Selected User Is Not Moderatable By This Bot.");

    if (member.roles.highest.position < user.roles.highest.position)
      errorsArray.push("Selected User Has A Higher Role Than You.");

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

    await user.ban({
      days: 7,
      reason: reason,
    });

    const successEmbed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({
        text: "Github -> https://github.com/josephistired",
      })
      .setColor("Green")
      .addFields(
        {
          name: "User Banned:",
          value: `\`\`\`${user.user.tag}\`\`\``,
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

    console.log(`
      \nWarning: Moderator Banned A User - Look Above For User Who Executed The Ban.
      \nUser Who Was Banned:\n${user.user.tag}
      \nReason For Ban:\n${reason}
      `);

    user
      .send(`${successEmbed}`)
      .catch((error) =>
        console.log(
          "User's DM's Are Closed! Still Banning But Not Going To DM!"
        )
      );
    return interaction.reply({ embeds: [successEmbed] });
  },
};
