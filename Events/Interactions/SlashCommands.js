const {
  ChatInputCommandInteraction,
  Collection,
  PermissionFlagsBits,
} = require("discord.js");
const { connection } = require("mongoose");

const { commandlogSend } = require("../../Functions/commandlogSend");
const { errorSend } = require("../../Functions/errorlogSend");
const { cooldownSend } = require("../../Functions/cooldownlogSend");

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

    if (connection.readyState === 0)
      errorsArray.push(
        "Unable to connect to the database. Please check that you have provided a valid database URL in your configuration file. You can find instructions for setting up the database in our documentation at https://discord-bot-v14-docs.vercel.app/docs/intro"
      );

    if (!command) errorsArray.push("💤 Command Is Outdated.");

    if (command.developer && interaction.user.id !== process.env.DEVELOPERID)
      errorsArray.push(
        "Sorry, this command is only available to the person who set up this bot. Maybe you can convince them to run it for you!"
      );

    if (command.testing === true)
      errorsArray.push(
        "This command is currently in testing and is not available for use at this time."
      );

    const { cooldowns } = client;
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = process.env.COMMAND_COOLDOWN * 1000 || 3 * 1000;

    if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    } else {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;

        cooldownSend(
          {
            left: `${timeLeft.toFixed(1)}`,
            user: `${interaction.member.user.tag}`,
            command: `${interaction.commandName}`,
            time: `${sent}`,
          },
          interaction
        );

        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${interaction.user.username}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }

    try {
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
      commandlogSend(
        {
          command: `${interaction.commandName}`,
          user: `${interaction.member.user.tag}`,
          place: `${interaction.channel.name}`,
          time: `${sent}`,
        },
        interaction
      );
    } catch (error) {
      return errorSend(
        {
          user: `${interaction.user.username}`,
          command: `${interaction.commandName}`,
          error: `${error}`,
          time: `${parseInt(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }
  },
};
