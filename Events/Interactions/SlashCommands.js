const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require("discord.js");
const moment = require("moment");
const { connection } = require("mongoose");
const { commandlogSend } = require("../../Functions/commandlogSend");
const { moderationlogSend } = require("../../Functions/moderationlogSend");
require("dotenv").config();

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    const sent = parseInt(interaction.createdTimestamp / 1000);

    const errorsArray = [];

    const attachment = new AttachmentBuilder("assets/error.gif");

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red")
      .setImage("attachment://error.gif")
      .setTimestamp();

    if (connection.readyState == 0)
      errorsArray.push(
        "Hoster Of This Bot Failed To Provide Their Database URL! The Bot Won't Work Unless One Is Provided. Please Tell Them Provide It In The Config File!"
      );

    if (!command) errorsArray.push("💤 Command Is Outdated.");

    if (command.developer && interaction.user.id !== process.env.DEVELOPERID)
      errorsArray.push("Command Is Only Available To The Hoster Of This Bot!");

    if (command.testing == true)
      errorsArray.push(
        "Command Is In Testing Phase! Vist The Github For More Infortmation!"
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
        components: [
          new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setLabel("Report Errors On The Bot's Github")
              .setStyle(ButtonStyle.Link)
              .setURL(
                "https://github.com/josephistired/DiscordBot-v14/issues/new/choose"
              )
          ),
        ],
        ephemeral: true,
        files: [attachment],
      });

    const subCommand = interaction.options.getSubcommand(false);
    if (subCommand) {
      const subCommandFile = client.subCommands.get(
        `${interaction.commandName}.${subCommand}`
      );
      if (!subCommandFile)
        return interaction.reply({
          content: "💤 Command Is Outdated.",
          ephemeral: true,
        });
      subCommandFile.execute(interaction, client);
    } else command.execute(interaction, client);
    if (command.moderation == true) return;
    commandlogSend(
      {
        command: `${interaction.commandName}`,
        user: `${interaction.member.user.tag}`,
        place: `${interaction.channel.name}`,
        time: `${sent}`,
      },
      interaction
    );
  },
};
