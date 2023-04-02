const { loadFiles } = require("../Functions/fileLoader");

async function loadEvents(client) {
  console.time("Events Loaded");

  const events = [];

  try {
    client.events = new Map();

    const files = await loadFiles("Events");

    for (const file of files) {
      try {
        const event = require(file);
        const { name, execute, once, rest } = event;

        const target = rest ? client.rest : client;
        const eventName = once ? "once" : "on";
        const eventHandler = (...args) => execute(...args, client);

        target[eventName](name, eventHandler);
        client.events.set(name, eventHandler);

        events.push({ Event: name, Status: "✅" });
      } catch (error) {
        console.error(error);

        const eventName = file.split("/").pop().slice(0, -3);
        const status = "🛑";
        const errorMessage = error.stack;

        events.push({ Event: eventName, Status: status, Error: errorMessage });
      }
    }

    console.table(events, ["Event", "Status", "Error"]);
    console.info(`\n\x1b[36mLoaded ${events.length} events.\x1b[0m`);
  } catch (error) {
    console.error(error);
  }

  console.timeEnd("Events Loaded");
}

module.exports = { loadEvents };
