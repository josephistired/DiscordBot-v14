const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const Transcript = require("discord-html-transcripts");

module.exports = {
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
  async execute(interaction) {
    const { options, member } = interaction;

    const amount = options.getNumber("amount");
    const reason = options.getString("reason");
    const user = options.getUser("user");

    const channelMessages = await interaction.channel.messages.fetch();

    const logChannel = interaction.guild.channels.cache.get(""); // CHANGE TO YOUR LOGGING CHANNEL

    const successEmbed = new EmbedBuilder().setColor("Green");
    const logEmbed = new EmbedBuilder()
      .setColor("Green")
      .setAuthor({ name: "🧹 Purge Command Executed!" })
      .setTimestamp()
      .addFields(
        {
          name: "👤 User:",
          value: `\`\`\`${user.username || "No specified user"}\`\`\``,
        },
        {
          name: "🔘 Channel:",
          value: `\`\`\`${interaction.channel.name}\`\`\``,
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

        logChannel.send({
          embeds: [
            logEmbed.addFields({
              name: "🔢 Total Messages:",
              value: `\`\`\`${messages.size}\`\`\``,
            }),
          ],
          files: [transcript],
        });
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

        logChannel.send({
          embeds: [
            logEmbed.addFields({
              name: "🔢 Total messages:",
              value: `\`\`\`${messages.size}\`\`\``,
            }),
          ],
          files: [transcript],
        });
      });
    }
  },
};
