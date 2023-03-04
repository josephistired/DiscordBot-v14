async function loadAllCommands(client) {
  const { loadAllFiles } = require("../functions/fileLoader");

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
  });

  client.application.commands.set(commmandsArray);
}

module.exports = { loadAllCommands };
