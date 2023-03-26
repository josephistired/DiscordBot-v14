const { ButtonInteraction, EmbedBuilder } = require("discord.js");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const splitArray = interaction.customId.split("-");
    if (!splitArray[0] === "MemberLogging") return;

    const member = (await interaction.guild.members.fetch()).get(splitArray[2]);
    const embed = new EmbedBuilder();
    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    if (!interaction.member.permissions.has("KickMembers"))
      errorsArray.push(
        "You do not have the required permission for this action."
      );

    if (!member)
      errorsArray.push("This user is no longer a member of this server.");

    if (!member.moderatable)
      errorsArray.push(
        `${member.user.username} is not moderatable by this bot.`
      );

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

    const successEmbed = new EmbedBuilder().setColor("Green").setTimestamp();

    switch (splitArray[1]) {
      case "Kick":
        {
          member.kick().then(() => {
            interaction
              .reply({
                embeds: [
                  successEmbed.setDescription(
                    `👟 \n Kicked \`${member.user.username}\` from the server!`
                  ),
                ],
                ephemeral: true,
              })
              .catch(() => {
                errorsArray.push(
                  `${member.user.username} could not be kicked.`
                );
              }),
              moderationlogSend(
                {
                  action: "Kick",
                  moderator: `${interaction.user.tag}`,
                  user: `${member}`,
                  reason: `Member Logging System`,
                  emoji: "👟",
                },
                interaction
              );
          });
        }
        break;
      case "Ban": {
        member.ban().then(() => {
          interaction
            .reply({
              embeds: [
                successEmbed.setDescription(
                  `🔨 \n Banned \`${member.user.username}\` from the server!`
                ),
              ],
              ephemeral: true,
            })
            .catch(() => {
              errorsArray.push(`${member.user.username} could not be banned.`);
            }),
            moderationlogSend(
              {
                action: "Ban",
                moderator: `${interaction.user.tag}`,
                user: `${member}`,
                reason: `Member Logging System`,
                emoji: "🔨",
              },
              interaction
            );
        });
      }
    }
  },
};
