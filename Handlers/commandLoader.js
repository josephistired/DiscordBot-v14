const { loadFiles } = require("../Functions/fileLoader");
const { Collection } = require("discord.js");

async function loadCommands(client) {
  const commands = new Collection();
  const subCommands = new Collection();
  const definitions = [];

  for (const file of await loadFiles("Commands")) {
    const command = require(file);
    const key = command.subCommand ?? command.data?.name;
    const collection = command.subCommand ? subCommands : commands;
    if (!key || collection.has(key))
      throw new Error(`Invalid or duplicate command: ${file}`);
    if (command.subCommand && typeof command.execute !== "function") {
      throw new Error(`Missing subcommand execute function: ${file}`);
    }
    collection.set(key, command);
    if (!command.subCommand) definitions.push(command.data.toJSON());
  }

  // Keep the current registry if loading or registration fails.
  await client.application.commands.set(definitions);
  client.commands = commands;
  client.subCommands = subCommands;
  console.info(
    `Loaded ${commands.size} commands and ${subCommands.size} subcommands.`,
  );
}

module.exports = { loadCommands };
