require("dotenv").config();

const { loadAllCommands } = require("../../Handlers/commandLoader");
const boxen = require("boxen");
const colors = require("chalk");

const status = ["ERROR", "OK"];

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.user.setActivity(`${client.guilds.cache.size} Guilds`);

    loadAllCommands(client);

    const { connect, connection } = require("mongoose");

    await connect(process.env.DATABASEURL);

    let xp = require("simply-xp");

    xp.connect(process.env.DATABASEURL, {
      notify: false,
    });

    const green = colors.hex("#46ff00");

    console.log(
      boxen(
        `\n ${green.bold("         🟢 ONLINE")}    \n           ${colors.gray(
          client.user.username
        )}  \n\n     Commands:   ${green.bold(
          "OK"
        )}    \n     Events:     ${green.bold("OK")}

            \n     Mongoose DB: ${green.bold(
              status[connection.readyState]
            )}            \n     XP DB: ${green.bold(
          status[connection.readyState]
        )}
`,
        {
          title: "Information",
          titleAlignment: "center",
          padding: 2,
          margin: 2,
          borderColor: "green",
          borderStyle: "classic",
        }
      )
    );
  },
};
