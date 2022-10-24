const { loadAllCommands } = require("../../Handlers/commandLoader");
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    client.user.setActivity(`${client.guilds.cache.size} Guilds`);

    loadAllCommands(client);

    console.log(`\nClient Logged In As: ${client.user.username}\n`);

    const { connect } = require("mongoose");
    connect(client.config.DatabaseURL, {}).then(() =>
      console.log(`\n\n\nClient Is Connected To The Database\n\n\n`)
    );

    let xp = require("simply-xp");

    xp.connect(client.config.DatabaseURL, {
      notify: true,
    });
  },
};
