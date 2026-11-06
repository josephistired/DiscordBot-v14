const { test } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { Collection } = require("discord.js");
const mongoose = require("mongoose");
const { loadFiles } = require("../Functions/fileLoader");
const fileLoader = require("../Functions/fileLoader");
const logModel = require("../Schemas/logs");
logModel.findOne = async () => null;
const dispatch = require("../Events/Interactions/SlashCommands").execute;
require("../Schemas/poll");
mongoose.connection.readyState = 1;

function fixture(name = "one", command = { execute: async () => {} }) {
  const responses = [];
  const interaction = {
    isChatInputCommand: () => true,
    inGuild: () => true,
    commandName: name,
    createdTimestamp: Date.now(),
    user: {
      id: "123",
      username: "tester",
      tag: "tester",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    memberPermissions: { has: () => false },
    options: { getSubcommand: () => null },
    guild: { id: "guild" },
    channel: { name: "test" },
    reply: async (response) => responses.push(response),
    followUp: async (response) => responses.push(response),
    editReply: async (response) => responses.push(response),
  };
  const client = {
    commands: new Collection([[name, command]]),
    subCommands: new Collection(),
    cooldowns: new Collection(),
  };
  return { interaction, client, responses };
}

test("unknown commands reply instead of accessing undefined command properties", async () => {
  const f = fixture();
  f.client.commands.clear();
  await dispatch(f.interaction, f.client);
  assert.equal(f.responses.length, 1);
  assert.match(f.responses[0].embeds[0].toJSON().fields[2].value, /Outdated/);
  assert.equal(f.responses[0].files, undefined);
});

test("cooldowns isolate commands and enforce repeat invocations", async () => {
  let calls = 0;
  const f = fixture("one", { cooldown: 60, execute: async () => calls++ });
  f.client.commands.set("two", { cooldown: 60, execute: async () => calls++ });
  await dispatch(f.interaction, f.client);
  await dispatch(f.interaction, f.client);
  f.interaction.commandName = "two";
  await dispatch(f.interaction, f.client);
  assert.equal(calls, 2);
  assert.equal(f.responses.length, 1);
});

test("async failures after deferral complete the deferred reply", async () => {
  const f = fixture("one", {
    cooldown: 0,
    execute: async (i) => {
      i.deferred = true;
      throw new Error("private detail");
    },
  });
  f.interaction.reply = async () => assert.fail("must not reply twice");
  await dispatch(f.interaction, f.client);
  assert.equal(f.responses.length, 1);
  assert.doesNotMatch(
    f.responses[0].embeds[0].toJSON().fields[2].value,
    /private detail/,
  );
});

test("file discovery works outside the repository directory", async () => {
  const previous = process.cwd();
  try {
    process.chdir("/tmp");
    assert.ok((await loadFiles("Commands")).length > 0);
  } finally {
    process.chdir(previous);
  }
});

test("event reload preserves external listeners and multiple handlers for one event", async () => {
  const original = fileLoader.loadFiles;
  fileLoader.loadFiles = async () => [
    require.resolve("../Events/Interactions/SlashCommands"),
    require.resolve("../Events/Buttons/PollButtons"),
  ];
  delete require.cache[require.resolve("../Handlers/eventLoader")];
  const { loadEvents } = require("../Handlers/eventLoader");
  const client = new EventEmitter();
  client.rest = new EventEmitter();
  client.isReady = () => false;
  const external = () => {};
  client.on("interactionCreate", external);
  try {
    await loadEvents(client);
    await loadEvents(client);
    assert.equal(client.listenerCount("interactionCreate"), 3);
    assert.ok(client.listeners("interactionCreate").includes(external));
  } finally {
    fileLoader.loadFiles = original;
  }
});

test("failed registration preserves the working command registry", async () => {
  mongoose.connection.readyState = 0;
  const { loadCommands } = require("../Handlers/commandLoader");
  const commands = new Collection([["existing", {}]]);
  const client = {
    commands,
    subCommands: new Collection(),
    application: {
      commands: {
        set: async () => {
          throw new Error("registration failed");
        },
      },
    },
  };
  await assert.rejects(loadCommands(client), /registration failed/);
  assert.equal(client.commands, commands);
});

test("all command definitions serialize and register successfully", async () => {
  const { loadCommands } = require("../Handlers/commandLoader");
  let definitions;
  const client = {
    application: {
      commands: {
        set: async (value) => {
          definitions = value;
        },
      },
    },
  };
  await loadCommands(client);
  assert.ok(definitions.length > 0);
  assert.equal(definitions.length, client.commands.size);
  for (const key of client.subCommands.keys())
    assert.ok(client.commands.has(key.split(".")[0]));
});
