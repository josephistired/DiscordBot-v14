async function loadAllCommands(client) {
  const { loadAllFiles } = require("../Functions/fileLoader");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Command Name", "Status Of Command");

  await client.commands.clear();
  await client.subCommands.clear();

  let commmandsArray = [];

  const Files = await loadAllFiles("Commands");

  Files.forEach((file) => {
    const command = require(file);

    if (command.subCommand)
      return client.subCommands.set(command.subCommand, command);

    client.commands.set(command.data.name, command);

    commmandsArray.push(command.data.toJSON());

    table.addRow(command.data.name, "Running");
  });

  client.application.commands.set(commmandsArray);

  return console.log(table.toString(), "\nCommands Loaded");
}

module.exports = { loadAllCommands };
