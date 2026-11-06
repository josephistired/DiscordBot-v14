const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  Colors,
  MessageFlags,
  PermissionFlagsBits: P,
  Collection,
} = require("discord.js");
const economy = require("../Functions/economy");
const Account = require("../Schemas/economy");
const Verification = require("../Schemas/verification");
const Welcome = require("../Schemas/welcome");
const Logs = require("../Schemas/logs");

function fixture() {
  const replies = [];
  const options = {
    getUser: () => ({
      id: "target",
      bot: false,
      username: "target",
      toString: () => "<@target>",
    }),
    getInteger: () => 25,
    getString: () => "cookie",
  };
  const interaction = {
    guildId: "guild",
    user: {
      id: "actor",
      username: "actor",
      tag: "actor",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    options,
    createdTimestamp: Date.now(),
    memberPermissions: { has: () => true },
    guild: { members: { fetch: async () => ({}) } },
    async deferReply(value) {
      assert.equal(value.flags, MessageFlags.Ephemeral);
      this.deferred = true;
    },
    editReply: async (reply) => replies.push(reply),
  };
  return { interaction, replies };
}
function success(reply) {
  assert.equal(reply.content, undefined);
  const embed = reply.embeds[0].toJSON();
  assert.equal(embed.color, Colors.Green);
  assert.ok(embed.title);
  assert.ok(embed.timestamp);
  return embed;
}

test("all economy subcommands use the existing green embed layout and retain their service arguments", async (t) => {
  const calls = [];
  for (const method of ["account", "reward", "move", "pay", "grant", "buy"]) {
    t.mock.method(economy, method, async (...args) => {
      calls.push([method, ...args]);
      return {
        account: { wallet: 75, bank: 25, inventory: new Map([["cookie", 1]]) },
        reward: 250,
        move: { wallet: 50, bank: 50 },
        buy: { name: "Cookie", price: 25 },
      }[method];
    });
  }
  t.mock.method(Account, "aggregate", async () => [
    { User: "target", total: 100 },
  ]);
  for (const name of [
    "balance",
    "daily",
    "work",
    "deposit",
    "withdraw",
    "pay",
    "grant",
    "shop",
    "buy",
    "inventory",
    "leaderboard",
  ]) {
    const f = fixture();
    const command = require(`../Commands/Systems/Economy/${name}`);
    assert.equal(command.subCommand, `economy.${name}`);
    await command.execute(f.interaction);
    assert.equal(f.replies.length, 1);
    success(f.replies[0]);
    assert.deepEqual(f.replies[0].allowedMentions, { parse: [] });
  }
  assert.ok(
    calls.some(
      (c) =>
        JSON.stringify(c) ===
        JSON.stringify(["pay", "guild", "actor", "target", 25]),
    ),
  );
  assert.ok(
    calls.some(
      (c) =>
        JSON.stringify(c) ===
        JSON.stringify(["move", "guild", "actor", 25, true]),
    ),
  );
  assert.ok(
    calls.some(
      (c) =>
        JSON.stringify(c) ===
        JSON.stringify(["move", "guild", "actor", 25, false]),
    ),
  );
});

test("economy failures use the shared red error embed after deferral", async (t) => {
  t.mock.method(economy, "reward", async () => {
    throw new Error("Reward unavailable. Please wait.");
  });
  const f = fixture();
  await require("../Commands/Systems/Economy/daily").execute(f.interaction);
  assert.equal(f.replies.length, 1);
  const embed = f.replies[0].embeds[0].toJSON();
  assert.equal(embed.color, Colors.Red);
  assert.match(
    embed.fields.find((field) => field.name.includes("Error")).value,
    /Reward unavailable/,
  );
});

test("verification setup, status, and protection use embeds without changing permission operations", async (t) => {
  const f = fixture();
  const i = f.interaction;
  const everyone = { id: "guild" };
  const me = {
    id: "bot",
    permissions: { has: () => true },
    roles: { highest: { comparePositionTo: () => 1 } },
  };
  const role = {
    id: "verified",
    managed: false,
    permissions: { has: () => false },
  };
  let panel;
  const writes = [];
  const lobby = {
    id: "lobby",
    guildId: "guild",
    parentId: "outside",
    isTextBased: () => true,
    permissionsFor: (subject) => ({
      has: (permission) => subject !== everyone || permission === P.ViewChannel,
    }),
    send: async (payload) => {
      panel = payload;
      return { id: "panel", delete: async () => {} };
    },
  };
  const config = {
    channel: "lobby",
    role: "verified",
    message: "panel",
    gates: new Map(),
  };
  let stored = null;
  t.mock.method(Verification, "findOne", async () => stored);
  t.mock.method(Verification, "init", async () => {});
  t.mock.method(Verification, "findOneAndUpdate", async (filter, update) => {
    writes.push([filter, update]);
    stored = config;
  });
  t.mock.method(Verification, "updateOne", async (filter, update) => {
    writes.push([filter, update]);
  });
  t.mock.method(Welcome, "findOne", async () => null);
  i.guild = {
    id: "guild",
    members: { me },
    roles: { everyone, fetch: async () => role },
    channels: { fetch: async () => lobby },
  };
  i.options.getRole = () => role;
  i.options.getChannel = () => lobby;
  await require("../Commands/Systems/Verification/setup").execute(i);
  success(f.replies.pop());
  success(panel);
  assert.deepEqual(writes[0], [
    { Guild: "guild" },
    { channel: "lobby", role: "verified", message: "panel" },
  ]);
  await require("../Commands/Systems/Verification/status").execute(i);
  const status = success(f.replies.pop());
  assert.equal(status.fields[0].value, "<#lobby>");
  let overwrites;
  const category = {
    id: "category",
    permissionsFor: () => ({ has: () => true }),
    children: { cache: new Collection() },
    permissionOverwrites: {
      cache: new Collection(),
      set: async (value) => {
        overwrites = value;
      },
    },
  };
  i.options.getChannel = () => category;
  i.options.getBoolean = () => true;
  await require("../Commands/Systems/Verification/protect").execute(i);
  success(f.replies.pop());
  assert.equal(
    overwrites.find((o) => o.id === "guild").deny & P.ViewChannel,
    P.ViewChannel,
  );
  assert.equal(
    overwrites.find((o) => o.id === "verified").allow & P.ViewChannel,
    P.ViewChannel,
  );
  assert.ok(writes[1][1].$set["gates.category"]);
});

test("log-options uses green setting fields and the shared red setup error", async (t) => {
  const f = fixture();
  f.interaction.commandName = "log-options";
  f.interaction.options.getString = () => "messages";
  f.interaction.options.getBoolean = () => false;
  let update;
  t.mock.method(Logs, "findOneAndUpdate", async (filter, change) => {
    update = [filter, change];
    return {};
  });
  await require("../Commands/Moderation/log-options").execute(f.interaction);
  const embed = success(f.replies.pop());
  assert.deepEqual(update, [
    { Guild: "guild" },
    { $set: { "events.messages": false } },
  ]);
  assert.equal(
    embed.fields.find((field) => field.name === "Status:").value,
    "Disabled",
  );
  t.mock.method(Logs, "findOneAndUpdate", async () => null);
  await require("../Commands/Moderation/log-options").execute(f.interaction);
  assert.equal(f.replies.pop().embeds[0].toJSON().color, Colors.Red);
});
