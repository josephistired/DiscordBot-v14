const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Converter = require("timestamp-conv");
const { connection } = require("mongoose");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    const sent = `${
      new Converter.timestamp(interaction.createdTimestamp).formatSeconds
    }`;

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error Executing Command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif")
      .setTimestamp();

    if (connection == 0)
      errorsArray.push(
        "Hoster Of This Bot Failed To Provide Their Database URL! The Bot Won't Work Unless One Is Provided. Please Tell Them Provide It In The Config File!"
      );

    if (!command) errorsArray.push("💤 Command Is Outdated.");

    if (command.developer && interaction.user.id !== "")
      // Provide Your ID!
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
              .setURL("https://github.com/josephistired")
          ),
        ],
        ephemeral: true,
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
    console.log(`
    \nExecuted:\n${interaction.commandName} - Command
    \nExecuted By:\n${interaction.member.user.tag}
    \nGuild:\n${interaction.guild.name}
    \nChannel:\n${interaction.channel.name}
    \nTime:\n${sent}`);
  },
};
