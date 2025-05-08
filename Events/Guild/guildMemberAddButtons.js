const { ButtonInteraction, EmbedBuilder } = require("discord.js");

const { moderationlogSend } = require("../../Functions/moderationlogSend");
const { errorSend } = require("../../Functions/errorlogSend");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const splitArray = interaction.customId.split("-");

    if (splitArray[0] !== "MemberLogging") return;
    const member = (await interaction.guild.members.fetch()).get(splitArray[2]);

    const errorsArray = [];

    if (!interaction.member.permissions.has("KickMembers"))
      errorsArray.push(
        "You do not have the required permission for this action.",
      );

    if (!member)
      errorsArray.push("This user is no longer a member of this server.");

    if (!member.moderatable)
      errorsArray.push(
        `${member.user.username} is not moderatable by this bot.`,
      );

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member.user.username}`,
          command: `Member Logging System Buttons`,
          error: `${errorsArray.join("\n")}`,
          time: `${Math.floor(interaction.createdTimestamp / 1000)}`,
        },
        interaction,
      );
    }

    const successEmbed = new EmbedBuilder().setColor("Green").setTimestamp();

    switch (splitArray[1]) {
      case "Kick":
        member.kick().then(() => {
          interaction.reply({
            embeds: [
              successEmbed.setDescription(
                `👟 \n Kicked \`${member.user.username}\` from the server!`,
              ),
            ],
            ephemeral: true,
          });
          moderationlogSend(
            {
              action: "Kick",
              moderator: `${interaction.user.tag}`,
              user: `${member}`,
              reason: `Member Logging System`,
              emoji: "👟",
            },
            interaction,
          ).catch(() => {
            errorsArray.push(`${member.user.username} could not be kicked.`);
          });
        });
        break;
      case "Ban":
        member.ban().then(() => {
          interaction.reply({
            embeds: [
              successEmbed.setDescription(
                `🔨 \n Banned \`${member.user.username}\` from the server!`,
              ),
            ],
            ephemeral: true,
          });
          moderationlogSend(
            {
              action: "Ban",
              moderator: `${interaction.user.tag}`,
              user: `${member}`,
              reason: `Member Logging System`,
              emoji: "🔨",
            },
            interaction,
          ).catch(() => {
            errorsArray.push(`${member.user.username} could not be banned.`);
          });
        });
        break;
      default:
        // do nothing
        break;
    }
  },
};
