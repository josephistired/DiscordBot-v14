const { Collection, PermissionFlagsBits } = require("discord.js");
const { connection } = require("mongoose");
const { commandlogSend } = require("../../Functions/commandlogSend");
const { errorSend } = require("../../Functions/errorlogSend");
const { cooldownSend } = require("../../Functions/cooldownlogSend");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    const sent = Math.floor(interaction.createdTimestamp / 1000);
    const reportError = (error) =>
      errorSend(
        {
          user: interaction.user.username,
          command: interaction.commandName,
          error: String(error),
          time: sent,
        },
        interaction,
      );

    if (!interaction.inGuild())
      return reportError("Please use commands in a server.");
    if (!command) return reportError("💤 Command Is Outdated.");
    if (command.developer && interaction.user.id !== process.env.DEVELOPERID) {
      return reportError("This command is only available to the bot owner.");
    }
    const required = command.data?.default_member_permissions;
    if (required && !interaction.memberPermissions?.has(BigInt(required))) {
      return reportError("You do not have permission to use this command.");
    }
    if (command.testing)
      return reportError("This command is currently in testing.");
    if (command.requiresDatabase !== false && connection.readyState !== 1)
      return reportError(
        "The database is unavailable. Please try again later.",
      );

    if (
      interaction.commandName === "giveaway" &&
      !client.giveawaysManager?.ready
    ) {
      return reportError(
        "Giveaways are still initializing. Please try again shortly.",
      );
    }

    const subCommand = interaction.options.getSubcommand(false);
    const handler =
      subCommand && !command.handlesSubcommands
        ? client.subCommands.get(`${interaction.commandName}.${subCommand}`)
        : command;
    if (typeof handler?.execute !== "function")
      return reportError("💤 Command Is Outdated.");

    const seconds = Number(
      command.cooldown ??
        process.env.COMMAND_COOLDOWN ??
        process.env.DEFAULT_COOLDOWN ??
        3,
    );
    const cooldownAmount =
      (Number.isFinite(seconds) && seconds >= 0 ? seconds : 3) * 1000;
    const now = Date.now();
    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) &&
      cooldownAmount > 0
    ) {
      const key = interaction.commandName;
      if (!client.cooldowns.has(key))
        client.cooldowns.set(key, new Collection());
      const timestamps = client.cooldowns.get(key);
      const expires = timestamps.get(interaction.user.id) ?? 0;
      if (now < expires) {
        return cooldownSend(
          {
            left: ((expires - now) / 1000).toFixed(1),
            user: interaction.user.tag,
            command: key,
            time: sent,
          },
          interaction,
        );
      }
      const expiration = now + cooldownAmount;
      timestamps.set(interaction.user.id, expiration);
      setTimeout(() => {
        if (timestamps.get(interaction.user.id) === expiration)
          timestamps.delete(interaction.user.id);
        if (!timestamps.size) client.cooldowns.delete(key);
      }, cooldownAmount).unref();
    }

    try {
      await handler.execute(interaction, client);
    } catch (error) {
      console.error(`Command ${interaction.commandName} failed:`, error);
      return reportError("The command failed. Please try again later.");
    }
    await commandlogSend(
      {
        command: interaction.commandName,
        place: interaction.channel?.name ?? "Unknown channel",
        time: sent,
      },
      interaction,
    );
  },
};
