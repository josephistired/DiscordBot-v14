const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { PermissionFlagsBits: P } = require("discord.js");
const Account = require("../Schemas/economy");
const Poll = require("../Schemas/poll");
const Verification = require("../Schemas/verification");
const LogConfig = require("../Schemas/logs");
const economy = require("../Functions/economy");

function memoryAccounts(t) {
  const rows = new Map();
  const key = (f) => `${f.Guild}/${f.User}`;
  const get = (f) => rows.get(key(f));
  const matches = (row, f) =>
    row &&
    Object.entries(f).every(([k, v]) => {
      if (k === "$or") return v.some((option) => matches(row, option));
      if (v && typeof v === "object" && !(v instanceof Date)) {
        if ("$gte" in v && !(row[k] >= v.$gte)) return false;
        if ("$lte" in v && !(row[k] <= v.$lte)) return false;
        return true;
      }
      return v === null ? row[k] == null : row[k] === v;
    });
  const apply = (row, update) => {
    for (const [k, v] of Object.entries(update.$inc ?? {})) {
      if (k.startsWith("inventory."))
        row.inventory.set(
          k.slice(10),
          (row.inventory.get(k.slice(10)) ?? 0) + v,
        );
      else row[k] = (row[k] ?? 0) + v;
    }
    Object.assign(row, update.$set ?? {});
    return row;
  };
  t.mock.method(Account, "init", async () => {});
  t.mock.method(Account, "findOne", (f) => ({ session: async () => get(f) }));
  t.mock.method(Account, "updateOne", async (f, update, options) => {
    if (!get(f) && options?.upsert)
      rows.set(key(f), {
        Guild: f.Guild,
        User: f.User,
        wallet: 0,
        bank: 0,
        inventory: new Map(),
        dailyAt: null,
        workAt: null,
      });
    const row = get(f);
    if (!matches(row, f)) return { modifiedCount: 0 };
    apply(row, update);
    return { modifiedCount: 1 };
  });
  t.mock.method(Account, "findOneAndUpdate", async (f, update) => {
    const row = get(f);
    return matches(row, f) ? apply(row, update) : null;
  });
  let ended = false;
  t.mock.method(mongoose, "startSession", async () => ({
    async withTransaction(fn) {
      const snapshot = structuredClone(rows);
      try {
        await fn();
      } catch (error) {
        rows.clear();
        for (const [k, v] of snapshot) rows.set(k, v);
        throw error;
      }
    },
    async endSession() {
      ended = true;
    },
  }));
  return { rows, get, ended: () => ended };
}

test("economy separates guilds, rewards once under concurrency, and rejects invalid amounts", async (t) => {
  memoryAccounts(t);
  assert.equal((await economy.account("guild-a", "user")).wallet, 0);
  const results = await Promise.allSettled([
    economy.reward("guild-a", "user", "daily"),
    economy.reward("guild-a", "user", "daily"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await economy.account("guild-a", "user")).wallet, 250);
  assert.equal((await economy.account("guild-b", "user")).wallet, 0);
  for (const value of [-1, 0, 1.5, Infinity, 1e12])
    assert.throws(() => economy.amount(value));
});

test("bank and purchases prevent overdrafts and preserve total currency", async (t) => {
  memoryAccounts(t);
  await economy.grant("guild", "user", 100);
  await economy.move("guild", "user", 75, true);
  await assert.rejects(economy.move("guild", "user", 50, true));
  await economy.move("guild", "user", 25, false);
  await economy.buy("guild", "user", "cookie");
  const a = await economy.account("guild", "user");
  assert.equal(a.wallet, 25);
  assert.equal(a.bank, 50);
  assert.equal(a.inventory.get("cookie"), 1);
  await assert.rejects(economy.buy("guild", "user", "trophy"));
  assert.equal(a.wallet + a.bank, 75);
});

test("payments commit both sides and rollback insufficient funds or recipient overflow", async (t) => {
  const db = memoryAccounts(t);
  await economy.grant("guild", "one", 100);
  await economy.pay("guild", "one", "two", 40);
  assert.equal((await economy.account("guild", "one")).wallet, 60);
  assert.equal((await economy.account("guild", "two")).wallet, 40);
  await assert.rejects(economy.pay("guild", "one", "two", 70));
  db.get({ Guild: "guild", User: "two" }).wallet = economy.MAX_BALANCE;
  await assert.rejects(economy.pay("guild", "one", "two", 1));
  assert.equal((await economy.account("guild", "one")).wallet, 60);
  assert.equal(db.ended(), true);
  await assert.rejects(economy.pay("guild", "one", "one", 10));
});

test("poll votes stay deduplicated after handler reload and are isolated by guild", async (t) => {
  const rows = new Map();
  const key = (f) => `${f.Guild}/${f.Message}`;
  t.mock.method(Poll, "init", async () => {});
  t.mock.method(Poll, "updateOne", async (f, update) => {
    if (!rows.has(key(f)))
      rows.set(key(f), { ...update.$setOnInsert, votes: {} });
  });
  t.mock.method(Poll, "findOneAndUpdate", async (f, update) => {
    const row = rows.get(key(f));
    const voteKey = Object.keys(f)
      .find((k) => k.startsWith("votes."))
      .slice(6);
    if (row.votes[voteKey]) return null;
    row.votes[voteKey] = Object.values(update.$set)[0];
    for (const [k, value] of Object.entries(update.$inc)) row[k] += value;
    return row;
  });
  t.mock.method(Poll, "findOne", async (f) => rows.get(key(f)));
  let record = require("../Functions/polls").recordVote;
  const user = "123456789012345678";
  await Promise.all([
    record("a", "m", user, "Yes"),
    record("a", "m", user, "No"),
  ]);
  delete require.cache[require.resolve("../Functions/polls")];
  record = require("../Functions/polls").recordVote;
  assert.equal((await record("a", "m", user, "No")).counted, false);
  assert.equal(rows.get("a/m").yes + rows.get("a/m").no, 1);
  assert.equal((await record("b", "m", user, "No")).counted, true);
});

test("verification refuses privileged roles and validates the persisted panel before granting", async (t) => {
  const {
    validateVerificationRole,
    verifyMember,
  } = require("../Functions/verification");
  const me = {
    permissions: { has: () => true },
    roles: { highest: { comparePositionTo: () => 1 } },
  };
  const role = {
    id: "verified",
    managed: false,
    permissions: { has: () => false },
  };
  validateVerificationRole({ id: "guild" }, me, role);
  assert.throws(() =>
    validateVerificationRole({ id: "guild" }, me, {
      ...role,
      permissions: { has: (p) => p === P.Administrator },
    }),
  );
  let granted = 0;
  t.mock.method(Verification, "findOne", async (f) =>
    f.Guild === "guild"
      ? { channel: "lobby", message: "panel", role: "verified" }
      : null,
  );
  const i = {
    inCachedGuild: () => true,
    guildId: "guild",
    channelId: "lobby",
    message: { id: "panel", author: { id: "bot" } },
    client: { user: { id: "bot" } },
    user: { id: "member" },
    guild: {
      id: "guild",
      roles: { fetch: async () => role },
      members: {
        me,
        fetch: async () => ({
          roles: { cache: new Map(), add: async () => granted++ },
        }),
      },
    },
  };
  await verifyMember(i);
  assert.equal(granted, 1);
  i.guildId = "another";
  await assert.rejects(verifyMember(i));
  assert.equal(granted, 1);
  i.guildId = "guild";
  i.message.id = "old-panel";
  await assert.rejects(verifyMember(i));
});

test("logging honors category switches and never routes a guild log to another guild", async (t) => {
  const { guildLog, enabled } = require("../Functions/guildLog");
  assert.equal(
    enabled({ events: new Map([["messages", false]]) }, "messages"),
    false,
  );
  assert.equal(enabled({}, "commands"), true);
  const sent = [];
  const channel = (id) => ({
    id,
    isSendable: () => true,
    send: async (p) => sent.push([id, p]),
  });
  const a = channel("a-log");
  const b = channel("b-log");
  t.mock.method(LogConfig, "findOne", async (f) => ({
    logChannel: `${f.Guild}-log`,
    events: { messages: f.Guild !== "b" },
  }));
  mongoose.connection.readyState = 1;
  try {
    await guildLog(
      { id: "a", channels: { cache: new Map([["a-log", a]]) } },
      "messages",
      "Deleted",
      "text",
      "source",
    );
    await guildLog(
      { id: "b", channels: { cache: new Map([["b-log", b]]) } },
      "messages",
      "Deleted",
      "text",
      "source",
    );
    await guildLog(
      { id: "a", channels: { cache: new Map([["a-log", a]]) } },
      "messages",
      "Deleted",
      "text",
      "a-log",
    );
    assert.equal(sent.length, 1);
    assert.equal(sent[0][0], "a-log");
    assert.deepEqual(sent[0][1].allowedMentions, { parse: [] });
  } finally {
    mongoose.connection.readyState = 0;
  }
});

test("verification protect refuses private categories and unprotect restores saved bitfields", async (t) => {
  const { Collection } = require("discord.js");
  const command = require("../Commands/Systems/Verification/protect");
  const role = {
    id: "verified",
    permissions: { has: () => false },
    managed: false,
  };
  const me = {
    id: "bot",
    permissions: { has: () => true },
    roles: { highest: { comparePositionTo: () => 1 } },
  };
  let changed = 0;
  let reply;
  let restored;
  const category = {
    id: "category",
    children: { cache: new Collection() },
    permissionsFor: (subject) => ({ has: () => subject !== "everyone" }),
    permissionOverwrites: {
      cache: new Collection(),
      set: async (value) => {
        changed++;
        restored = value;
      },
    },
  };
  let action = "protect";
  const config = { role: "verified", channel: "lobby", gates: new Map() };
  t.mock.method(Verification, "findOne", async () => config);
  let unset;
  t.mock.method(Verification, "updateOne", async (_f, u) => {
    unset = u.$unset;
  });
  const i = {
    guildId: "guild",
    user: {
      id: "admin",
      username: "admin",
      tag: "admin",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    deferred: true,
    createdTimestamp: Date.now(),
    memberPermissions: { has: () => true },
    options: {
      getSubcommand: () => action,
      getBoolean: () => true,
      getChannel: () => category,
    },
    guild: {
      id: "guild",
      members: { me },
      roles: { everyone: "everyone", fetch: async () => role },
      channels: { fetch: async () => ({ parentId: "outside" }) },
    },
    deferReply: async () => {},
    editReply: async (value) => {
      reply = value;
    },
  };
  await command.execute(i);
  assert.equal(changed, 0);
  assert.match(reply.embeds[0].toJSON().fields[2].value, /private category/);
  action = "unprotect";
  config.gates.set("category", {
    overwrites: [{ id: "guild", type: 0, allow: "1024", deny: "0" }],
  });
  await require("../Commands/Systems/Verification/unprotect").execute(i);
  assert.equal(changed, 1);
  assert.deepEqual(restored, [
    { id: "guild", type: 0, allow: 1024n, deny: 0n },
  ]);
  assert.deepEqual(unset, { "gates.category": 1 });
});

test("all configured logging events use current Discord.js event constants", () => {
  const { Events } = require("discord.js");
  const {
    definitions,
    createLoggingEvent,
  } = require("../Functions/loggingEvents");
  const names = new Set();
  for (const [name] of definitions) {
    assert.equal(typeof name, "string");
    assert.ok(Object.values(Events).includes(name));
    assert.ok(!names.has(name));
    names.add(name);
    assert.equal(typeof createLoggingEvent(name).execute, "function");
  }
  assert.ok(names.size >= 20);
});

test("economy grants are permission checked before any balance mutation", async (t) => {
  let grants = 0;
  let reply;
  t.mock.method(economy, "grant", async () => grants++);
  await require("../Commands/Systems/Economy/grant").execute({
    guildId: "guild",
    user: {
      id: "actor",
      username: "actor",
      tag: "actor",
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    deferred: true,
    createdTimestamp: Date.now(),
    memberPermissions: { has: () => false },
    options: {
      getSubcommand: () => "grant",
      getUser: () => ({ id: "target", bot: false }),
    },
    deferReply: async () => {},
    editReply: async (r) => {
      reply = r;
    },
  });
  assert.equal(grants, 0);
  assert.match(reply.embeds[0].toJSON().fields[2].value, /permission/);
});

test("dispatcher executes separately registered subcommand handlers", async (t) => {
  t.mock.method(LogConfig, "findOne", async () => null);
  let calls = 0;
  const command = {
    requiresDatabase: false,
    cooldown: 0,
  };
  await require("../Events/Interactions/SlashCommands").execute(
    {
      isChatInputCommand: () => true,
      inGuild: () => true,
      commandName: "economy",
      createdTimestamp: Date.now(),
      user: {
        id: "actor",
        username: "actor",
        tag: "actor",
        displayAvatarURL: () => "https://example.com/avatar.png",
      },
      deferred: true,
      memberPermissions: { has: () => true },
      options: { getSubcommand: () => "balance" },
    },
    {
      commands: new Map([["economy", command]]),
      subCommands: new Map([
        ["economy.balance", { execute: async () => calls++ }],
      ]),
    },
  );
  assert.equal(calls, 1);
});
