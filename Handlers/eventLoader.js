const { loadFiles } = require("../Functions/fileLoader");

async function loadEvents(client) {
  const files = await loadFiles("Events");
  // Prepare everything before replacing working listeners.
  const listeners = files.map((file) => {
    const event = require(file);
    if (!event.name || typeof event.execute !== "function") {
      throw new Error(`Invalid event module: ${file}`);
    }
    return {
      name: event.name,
      target: event.rest ? client.rest : client,
      once: event.once,
      handler: (...args) => Promise.resolve()
        .then(() => event.execute(...args, client))
        .catch((error) => console.error(`Event ${event.name} failed:`, error)),
    };
  });

  for (const { target, name, handler } of client.loadedEvents ?? []) {
    target.off(name, handler);
  }
  for (const listener of listeners) {
    // A reload must not rerun ready-time initialization.
    if (listener.once && listener.name === "ready" && client.isReady()) continue;
    listener.target[listener.once ? "once" : "on"](listener.name, listener.handler);
  }
  client.loadedEvents = listeners;
  console.info(`Loaded ${listeners.length} events.`);
}

module.exports = { loadEvents };
