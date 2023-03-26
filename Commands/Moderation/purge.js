const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const Transcript = require("discord-html-transcripts");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

module.exports = {
  moderation: true,
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Deletes messages in the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addNumberOption((options) =>
      options
        .setName("amount")
        .setDescription("Enter the number of messages you want to delete.")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addStringOption((options) =>
      options
        .setName("reason")
        .setDescription("The reason for purging the messages?")
        .setRequired(true)
    )
    .addUserOption((options) =>
      options.setName("user").setDescription("Select the user.")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, member } = interaction;

    const amount = options.getNumber("amount");
    const reason = options.getString("reason");
    const user = options.getUser("user");

    const channelMessages = await interaction.channel.messages.fetch();

    const successEmbed = new EmbedBuilder().setColor("Green");

    if (user) {
      let i = 0;
      let messagesDelete = [];
      channelMessages.filter((message) => {
        if (message.author.id === user.id && amount > i) {
          messagesDelete.push(message);
          i++;
        }
      });

      const transcript = await Transcript.generateFromMessages(
        messagesDelete,
        interaction.channel
      );

      interaction.channel.bulkDelete(messagesDelete, true).then((messages) => {
        interaction.reply({
          embeds: [
            successEmbed.setDescription(
              `🧹 \n Purged \`${messages.size}\` messages from ${user}!`
            ),
          ],
          ephemeral: true,
        });

        moderationlogSend(
          {
            action: "Purge",
            moderator: `${member.user.username}`,
            user: `${user.tag}`,
            reason: `${reason}`,
            emoji: "🧹",
            place: `${interaction.channel.name}`,
            size: `${messages.size}`,
            transcript: transcript,
          },
          interaction
        );
      });
    } else {
      const transcript = await Transcript.createTranscript(
        interaction.channel,
        { limit: amount }
      );

      interaction.channel.bulkDelete(amount, true).then((messages) => {
        interaction.reply({
          embeds: [
            successEmbed.setDescription(
              `🧹 \n Purged \`${messages.size}\` messages!`
            ),
          ],
          ephemeral: true,
        });

        moderationlogSend(
          {
            action: "Purge",
            moderator: `${member.user.username}`,
            reason: `${reason}`,
            emoji: "🧹",
            place: `${interaction.channel.name}`,
            size: `${messages.size}`,
            transcript: transcript,
          },
          interaction
        );
      });
    }
  },
};
