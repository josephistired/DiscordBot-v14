const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  PermissionFlagsBits,
  MessageFlags,
  Events,
  InteractionContextType,
} = require("discord.js");
const mongoose = require("mongoose");
const { validateTarget } = require("../Functions/moderationTarget");
const { createSocialCommand } = require("../Functions/socialCommand");
const superagent = require("superagent");
const logs = require("../Schemas/logs");
logs.findOne = async () => null;

function moderationFixture() {
  let calls = [];
  const target = {
    id: "target",
    user: { tag: "target" },
    bannable: true,
    kickable: true,
    moderatable: true,
    roles: { highest: {} },
    ban: async (options) => calls.push(["ban", options]),
    kick: async (reason) => calls.push(["kick", reason]),
    timeout: async (duration, reason) =>
      calls.push(["timeout", duration, reason]),
  };
  const interaction = {
    user: { id: "actor", tag: "actor" },
    guild: { ownerId: "owner" },
    member: { roles: { highest: { comparePositionTo: () => 1 } } },
    options: {
      getMember: () => target,
      getString: (key) => (key === "duration" ? "10m" : "test reason"),
    },
    deferReply: async (options) => calls.push(["defer", options]),
    editReply: async (response) => calls.push(["reply", response]),
  };
  return { interaction, target, calls };
}

test("role hierarchy blocks peers, self, owner, and unmanageable targets", () => {
  const f = moderationFixture();
  validateTarget(f.interaction, f.target, "kickable");
  assert.throws(() => validateTarget(f.interaction, null, "kickable"));
  f.target.id = "actor";
  assert.throws(() => validateTarget(f.interaction, f.target, "kickable"));
  f.target.id = "owner";
  assert.throws(() => validateTarget(f.interaction, f.target, "kickable"));
  f.target.id = "target";
  f.interaction.member.roles.highest.comparePositionTo = () => 0;
  assert.throws(() => validateTarget(f.interaction, f.target, "kickable"));
});

test("ban uses deleteMessageSeconds and kick passes an audit reason string", async () => {
  let f = moderationFixture();
  await require("../Commands/Moderation/ban").execute(f.interaction);
  assert.deepEqual(f.calls[1], [
    "ban",
    { deleteMessageSeconds: 604800, reason: "test reason" },
  ]);
  assert.equal(f.calls[0][1].flags, MessageFlags.Ephemeral);
  f = moderationFixture();
  await require("../Commands/Moderation/kick").execute(f.interaction);
  assert.deepEqual(f.calls[1], ["kick", "test reason"]);
});

test("timeouts reject invalid durations before taking action and await valid actions", async () => {
  const command = require("../Commands/Moderation/timeout");
  for (const invalid of ["-1m", "0s", "29d", "garbage"]) {
    const f = moderationFixture();
    f.interaction.options.getString = (key) =>
      key === "duration" ? invalid : "reason";
    await assert.rejects(command.execute(f.interaction));
    assert.equal(f.calls.length, 0);
  }
  const f = moderationFixture();
  await command.execute(f.interaction);
  assert.deepEqual(f.calls[1], ["timeout", 600000, "test reason"]);
});

test("social command defers before HTTP and increments the persisted count", async () => {
  const original = superagent.get;
  const steps = [];
  superagent.get = () => {
    steps.push("http");
    return {
      timeout: async () => ({ body: { link: "https://example.com/hug.gif" } }),
    };
  };
  let response;
  const model = {
    findOneAndUpdate: async (filter, update) => {
      assert.deepEqual(filter, { userId: "actor", targetId: "target" });
      assert.deepEqual(update, { $inc: { count: 1 } });
      return { count: 1 };
    },
  };
  const interaction = {
    options: { getUser: () => ({ id: "target", toString: () => "<@target>" }) },
    user: {
      id: "actor",
      username: "actor",
      tag: "actor",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    deferReply: async () => steps.push("defer"),
    editReply: async (r) => {
      response = r;
    },
  };
  try {
    const command = createSocialCommand({ name: "hug", past: "hugged", model });
    assert.deepEqual(command.data.toJSON().contexts, [
      InteractionContextType.Guild,
    ]);
    await command.execute(interaction);
    assert.deepEqual(steps, ["defer", "http"]);
    assert.equal(response.embeds[0].toJSON().footer.text, "Hugged 1 time");
  } finally {
    superagent.get = original;
  }
});

test("anti-link respects disabled settings and ignores DMs", async () => {
  const settings = require("../Schemas/links");
  const original = settings.findOneAndUpdate;
  const { enforceAntiLink } = require("../Functions/antiLink");
  mongoose.connection.readyState = 1;
  let reads = 0;
  settings.findOneAndUpdate = async (_filter, update) => {
    reads++;
    assert.ok(update.$setOnInsert);
    assert.equal(update.discordLinks, undefined);
    return { discordLinks: false };
  };
  try {
    await enforceAntiLink({ author: { bot: false } });
    assert.equal(reads, 0);
    await enforceAntiLink({
      guild: { id: "guild" },
      author: { id: "user", bot: false },
      content: "https://discord.gg/test",
      member: { permissions: { has: () => false } },
    });
    assert.equal(reads, 1);
  } finally {
    settings.findOneAndUpdate = original;
    mongoose.connection.readyState = 0;
  }
});

test("runtime permission checks prevent moderator commands from executing", async () => {
  const execute = require("../Events/Interactions/SlashCommands").execute;
  let called = false;
  let response;
  const command = {
    data: {
      default_member_permissions: String(PermissionFlagsBits.BanMembers),
    },
    execute: async () => {
      called = true;
    },
  };
  const interaction = {
    isChatInputCommand: () => true,
    inGuild: () => true,
    commandName: "ban",
    createdTimestamp: Date.now(),
    user: {
      username: "actor",
      tag: "actor",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    memberPermissions: { has: () => false },
    reply: async (r) => {
      response = r;
    },
  };
  await execute(interaction, { commands: new Map([["ban", command]]) });
  assert.equal(called, false);
  assert.equal(response.flags, MessageFlags.Ephemeral);
});

test("ready initialization uses current Discord.js event name", () => {
  assert.equal(require("../Events/Client/Ready").name, Events.ClientReady);
  assert.equal(Events.ClientReady, "clientReady");
});

test("purge excludes old messages and generates a transcript from selected messages", async () => {
  const { Collection } = require("discord.js");
  const transcript = require("discord-html-transcripts");
  const original = transcript.generateFromMessages;
  const recent = {
    id: "recent",
    author: { id: "target" },
    createdTimestamp: Date.now(),
  };
  const old = { id: "old", author: { id: "target" }, createdTimestamp: 0 };
  const other = {
    id: "other",
    author: { id: "other" },
    createdTimestamp: Date.now(),
  };
  let selected;
  let response;
  transcript.generateFromMessages = async (messages) => {
    selected = messages;
    return {};
  };
  const interaction = {
    user: { tag: "actor" },
    options: {
      getInteger: () => 10,
      getString: () => "cleanup",
      getUser: () => ({ id: "target", tag: "target" }),
    },
    deferReply: async () => {},
    editReply: async (value) => {
      response = value;
    },
    channel: {
      isTextBased: () => true,
      messages: {
        fetch: async () =>
          new Collection([
            ["recent", recent],
            ["old", old],
            ["other", other],
          ]),
      },
      bulkDelete: async (messages) => {
        assert.deepEqual(messages, [recent]);
        return { size: 1 };
      },
    },
  };
  try {
    await require("../Commands/Moderation/purge").execute(interaction);
    assert.deepEqual(selected, [recent]);
    assert.match(response, /Purged 1 messages/);
  } finally {
    transcript.generateFromMessages = original;
  }
});

test("poll updates serialize concurrent votes and preserve string field values", async () => {
  const { EmbedBuilder } = require("discord.js");
  const { votes, pending } = require("../Functions/pollState");
  votes.clear();
  pending.clear();
  let embed = new EmbedBuilder().addFields(
    { name: "Yes", value: "0" },
    { name: "No", value: "0" },
  );
  const message = {
    id: "poll",
    author: { id: "bot" },
    get embeds() {
      return [embed];
    },
    fetch: async () => message,
    edit: async ({ embeds }) => {
      embed = embeds[0];
    },
  };
  const interaction = (id) => ({
    isButton: () => true,
    customId: "Poll-Yes-poll",
    user: { id },
    message,
    client: { user: { id: "bot" } },
    deferReply: async () => {},
    editReply: async () => {},
  });
  const handler = require("../Events/Buttons/PollButtons").execute;
  await Promise.all([handler(interaction("one")), handler(interaction("two"))]);
  assert.equal(embed.toJSON().fields[0].value, "2");
  await handler(interaction("one"));
  assert.equal(embed.toJSON().fields[0].value, "2");
  assert.equal(pending.size, 0);
});

test("giveaway initialization waits for clientReady without registering legacy ready listeners", async (t) => {
  const { EventEmitter } = require("node:events");
  const { GatewayIntentBits } = require("discord.js");
  const intervals = [];
  t.mock.method(require("node:timers"), "setInterval", (callback) => {
    intervals.push(callback);
    return {};
  });
  const Manager = require("../src/giveawayManager");
  const client = new EventEmitter();
  client.options = { intents: [GatewayIntentBits.GuildMessageReactions] };
  const manager = new Manager(client, {});
  let reads = 0;
  manager.getAllGiveaways = async () => {
    reads++;
    return [];
  };
  assert.equal(reads, 0);
  assert.equal(client.listenerCount("ready"), 0);
  await assert.rejects(manager.initialize(), /clientReady/);
  client.readyAt = new Date();
  await Promise.all([manager.initialize(), manager.initialize()]);
  assert.equal(manager.ready, true);
  assert.equal(reads, 1);
  assert.equal(intervals.length, 1);
  assert.equal(client.listenerCount("ready"), 0);
  assert.equal(client.listenerCount("raw"), 1);
});

test("log-set validates channel access, persists settings, and does not require a guildConfig cache", async () => {
  const model = require("../Schemas/logs");
  const original = model.findOneAndUpdate;
  let saved;
  let reply;
  model.findOneAndUpdate = async (filter, update) => {
    saved = { filter, update };
  };
  const channel = {
    id: "channel",
    name: "logs",
    guildId: "guild",
    isTextBased: () => true,
    send: async () => {},
    permissionsFor: () => ({ has: () => true }),
  };
  const interaction = {
    guildId: "guild",
    guild: { id: "guild", members: { me: {} } },
    options: { getChannel: () => channel },
    deferReply: async () => {},
    editReply: async (value) => {
      reply = value;
    },
  };
  try {
    await require("../Commands/Moderation/logs-set").execute(interaction, {});
    assert.deepEqual(saved, {
      filter: { Guild: "guild" },
      update: { logChannel: "channel" },
    });
    assert.ok(reply.embeds);
    saved = undefined;
    channel.permissionsFor = () => ({ has: () => false });
    await assert.rejects(
      require("../Commands/Moderation/logs-set").execute(interaction, {}),
      /needs/,
    );
    assert.equal(saved, undefined);
  } finally {
    model.findOneAndUpdate = original;
  }
});

test("status remains usable while MongoDB is disconnected and reports actual units", async () => {
  const { Collection } = require("discord.js");
  const command = require("../Commands/Public/Utilities/status");
  let reply;
  let acknowledged;
  const client = {
    user: {
      username: "bot",
      tag: "bot",
      id: "id",
      flags: { has: () => false },
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    application: { owner: null },
    channels: { cache: new Collection() },
    guilds: { cache: new Collection() },
    users: { cache: new Collection() },
    commands: new Collection([["status", command]]),
    readyTimestamp: Date.now(),
    ws: { ping: 15 },
  };
  const interaction = {
    isChatInputCommand: () => true,
    inGuild: () => true,
    commandName: "status",
    createdTimestamp: Date.now(),
    user: { username: "actor", tag: "actor" },
    memberPermissions: { has: () => true },
    options: { getSubcommand: () => null },
    deferReply: async (value) => {
      acknowledged = value;
    },
    editReply: async (value) => {
      reply = value;
    },
  };
  mongoose.connection.readyState = 0;
  await require("../Events/Interactions/SlashCommands").execute(
    interaction,
    client,
  );
  assert.equal(acknowledged.flags, MessageFlags.Ephemeral);
  const fields = reply.embeds[0].toJSON().fields;
  assert.match(fields[1].value, /Heap used: .* MiB/);
  assert.match(fields[1].value, /Database: Disconnected/);
  assert.doesNotMatch(fields[1].value, /CPU Usage/);
});

test("multiplayer commands reject bot opponents and self-challenges before game startup", async () => {
  for (const filename of ["connectfour", "tictactoe", "rock-paper-scissors"]) {
    for (const opponent of [
      { id: "actor", bot: false },
      { id: "bot", bot: true },
    ]) {
      let response;
      await require(`../Commands/Public/Fun/Games/${filename}`).execute({
        user: { id: "actor" },
        options: { getUser: () => opponent },
        reply: async (value) => {
          response = value;
        },
      });
      assert.equal(response.flags, MessageFlags.Ephemeral);
      assert.match(response.content, /another human/);
    }
  }
});

test("avatar uses the selected global user when no guild member is available", async () => {
  let response;
  const selected = {
    id: "outside",
    displayName: "Outside User",
    displayAvatarURL: ({ size }) => `https://example.com/${size}.png`,
  };
  await require("../Commands/Public/Utilities/avatar").execute({
    user: { id: "actor", tag: "actor" },
    options: { getUser: () => selected, getMember: () => null },
    reply: async (value) => {
      response = value;
    },
  });
  const embed = response.embeds[0].toJSON();
  assert.match(embed.title, /Outside User/);
  assert.equal(embed.image.url, "https://example.com/4096.png");
});
