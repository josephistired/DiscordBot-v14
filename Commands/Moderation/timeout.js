const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
const { connection } = require("mongoose");
const Database = require("../../Schemas/infractions");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout A User.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select The User.")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("duration")
        .setDescription("Provide A Duration For The Timeout (1m, 1h, 1d).")
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("Provide A Reason For The Timeout.")
        .setMaxLength(512)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, member } = interaction;

    const user = options.getMember("user");
    const duration = options.getString("duration");
    const reason = options.getString("reason") || "Not Specified";

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

    if (!ms(duration) || ms(duration) > ms("28d"))
      errorsArray.push("Invaild Duration / Also Higher Than 28 Day Limit.");

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

    user.timeout(ms(duration), reason).catch((err) => {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "Could Not Timeout User Due To An Unknown Error."
          ),
        ],
      });
      return console.log("Error Occured In timeout.js", err);
    });

    const newInfractionObject = {
      IssuerID: member.id,
      IssuerTag: member.user.tag,
      Reason: reason,
      Date: Date.now(),
    };

    let userData = await Database.findOne({ Guild: guild.id, User: user.id });
    if (!userData)
      userData = await Database.create({
        Guild: guild.id,
        User: user.id,
        Infractions: [newInfractionObject],
      });
    else
      userData.Infractions.push(newInfractionObject) && (await userData.save());

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
          name: "Duration:",
          value: `\`\`\`${ms(ms(duration, { long: true }))}\`\`\``,
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
          name: "Infraction Total:",
          value: `\`\`\`${userData.Infractions.length} Infractions\`\`\``,
        }
      );

    console.log(`
      \nWarning: Moderator Timeout A User - Look Above For User Who Executed The Timeout.
      \nUser Who Was Muted:\n${user.user.tag}
      \nReason For Mute:\n${reason}
      `);
    return interaction.reply({ embeds: [successEmbed] });
  },
};
