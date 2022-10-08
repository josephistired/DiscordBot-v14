const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks User From Server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select The User.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("messages")
        .setDescription(
          "Choose A Number Of Days For Their To Messages To Be Deleted Up To."
        )
        .setRequired(true)
        .addChoices(
          { name: "Don't Delete Any.", value: "0" },
          { name: "Delete Up To Seven Days.", value: "7" }
        )
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide A Reason For The Kick.")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, member } = interaction;

    const user = options.getMember("user");
    const messages = options.getString("messages");
    const reason = options.getString("reason") || "Not Specified";

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red");

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

    await user.kick({
      messages: messages,
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
          name: "User:",
          value: `\`\`\`${user.user.tag}\`\`\``,
        },
        {
          name: "Reason:",
          value: `\`\`\`${reason}\`\`\``,
        },
        {
          name: "Moderator:",
          value: `\`\`\`${member.user.username}\`\`\``,
        },
        {
          name: "Messages Deleted:",
          value: `\`\`\`${messages} Days\`\`\``,
        }
      );

    console.log(`
      \nWarning: Moderator Kicked A User - Look Above For User Who Executed The Kick.
      \nUser Who Was Kicked:\n${user.user.tag}
      \nReason For Kick:\n${reason}
      `);

    user.send(`${successEmbed}`);
    return interaction.reply({ embeds: [successEmbed] });
  },
};
