const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const cooldown = new Map();
const Converter = require("timestamp-conv");

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

    if (!command)
      return interaction.reply({
        content: "💤 Command Is Outdated.",
        ephemeral: true,
      });

    if (command.developer && interaction.user.id !== "")
      // Provide Your ID!
      return interaction.reply({
        content: "⛔ Command Is Only Available To The Owner Of This Bot.",
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
