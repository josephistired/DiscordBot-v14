const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Collection, Colors, EmbedBuilder, ButtonStyle } = require("discord.js");
const mongoose = require("mongoose");
const Log = require("../Schemas/logs");
const Hug = require("../Schemas/hug");
const superagent = require("superagent");

for (const bannerURL of [null, "https://example.com/banner.png"]) {
  test(`whois displays ${bannerURL ? "a valid banner link" : "None for a missing banner"}`, async (t) => {
    const art = require("discord-arts");
    t.mock.method(art, "profileImage", async () => Buffer.from("image"));
    delete require.cache[require.resolve("../Commands/Public/Utilities/whois")];
    let forced;
    let response;
    const user = {
      id: "user",
      username: "tester",
      tag: "tester",
      createdTimestamp: 1500000000000,
      flags: { toArray: () => [] },
      async fetch(force) {
        forced = force;
        return this;
      },
      bannerURL: () => bannerURL,
    };
    const member = {
      id: "user",
      user,
      joinedTimestamp: 1600000000000,
      displayColor: Colors.Blue,
      roles: { cache: new Collection() },
      displayAvatarURL: () => "https://example.com/avatar.png",
    };
    await require("../Commands/Public/Utilities/whois").execute({
      options: { getMember: () => member },
      member,
      user,
      guildId: "guild",
      guild: {
        name: "test",
        members: { fetch: async () => new Collection([["user", member]]) },
      },
      deferReply: async () => {},
      editReply: async (value) => {
        response = value;
      },
    });
    const banner = response.embeds[0]
      .toJSON()
      .fields.find((field) => field.name === "Banner:");
    assert.equal(forced, true);
    assert.equal(banner.value, bannerURL ? `[Link](${bannerURL})` : "None");
    assert.doesNotMatch(banner.value, /null|undefined/);
  });
}

test("hug totals combine both directions and all historical rows without including other pairs", async (t) => {
  const rows = [
    { userId: "a", targetId: "b", count: 2 },
    { userId: "b", targetId: "a", count: 3 },
    { userId: "a", targetId: "b", count: 1 },
    { userId: "a", targetId: "c", count: 99 },
  ];
  t.mock.method(superagent, "get", () => ({
    timeout: async () => ({ body: { link: "https://example.com/hug.gif" } }),
  }));
  t.mock.method(Hug, "findOneAndUpdate", async (filter, update) => {
    assert.deepEqual(update, { $inc: { count: 1 } });
    const row = rows.find(
      (r) => r.userId === filter.userId && r.targetId === filter.targetId,
    );
    row.count++;
    return row;
  });
  t.mock.method(Hug, "aggregate", async (pipeline) => {
    const pairs = pipeline[0].$match.$or;
    assert.equal(pairs.length, 2);
    return [
      {
        count: rows
          .filter((row) =>
            pairs.some(
              (pair) =>
                pair.userId === row.userId && pair.targetId === row.targetId,
            ),
          )
          .reduce((sum, row) => sum + row.count, 0),
      },
    ];
  });
  const invoke = async (actor, target) => {
    let response;
    await require("../Commands/Public/Fun/hug").execute({
      user: {
        id: actor,
        username: actor,
        tag: actor,
        displayAvatarURL: () => "https://example.com/avatar.png",
      },
      options: {
        getUser: () => ({ id: target, toString: () => `<@${target}>` }),
      },
      deferReply: async () => {},
      editReply: async (value) => {
        response = value;
      },
    });
    return response.embeds[0].toJSON();
  };
  assert.equal(
    (await invoke("a", "b")).footer.text,
    "Hugged each other 7 times",
  );
  assert.equal(
    (await invoke("b", "a")).footer.text,
    "Hugged each other 8 times",
  );
  assert.equal(rows.find((r) => r.targetId === "c").count, 99);
});

test("new polls use neutral styling with distinct Yes/No buttons and no green image", async () => {
  let initial;
  let edited;
  await require("../Commands/Moderation/poll").execute({
    options: { getString: () => "Question?" },
    member: {
      user: { tag: "tester" },
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    reply: async (value) => {
      initial = value;
    },
    fetchReply: async () => ({ id: "poll" }),
    editReply: async (value) => {
      edited = value;
    },
  });
  const embed = initial.embeds[0].toJSON();
  assert.equal(embed.color, Colors.Blurple);
  assert.equal(embed.image, undefined);
  assert.deepEqual(
    embed.fields.map((f) => f.name),
    ["✅ Yes", "❌ No"],
  );
  const buttons = edited.components[0].toJSON().components;
  assert.deepEqual(
    buttons.map((b) => b.style),
    [ButtonStyle.Success, ButtonStyle.Danger],
  );
  assert.equal(edited.files, undefined);
});

test("voting refreshes the style of an existing green poll without losing totals", async (t) => {
  t.mock.method(require("../Functions/polls"), "recordVote", async () => ({
    counted: true,
    poll: { yes: 3, no: 5 },
  }));
  delete require.cache[require.resolve("../Events/Buttons/PollButtons")];
  let edited;
  const message = {
    id: "old",
    author: { id: "bot" },
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setImage("attachment://poll.gif")
        .addFields({ name: "Yes's", value: "3" }, { name: "No's", value: "4" }),
    ],
    fetch: async () => message,
    edit: async (value) => {
      edited = value;
    },
  };
  await require("../Events/Buttons/PollButtons").execute({
    isButton: () => true,
    customId: "Poll-No-old",
    guildId: "guild",
    message,
    user: { id: "voter" },
    client: { user: { id: "bot" } },
    deferReply: async () => {},
    editReply: async () => {},
  });
  const embed = edited.embeds[0].toJSON();
  assert.equal(embed.color, Colors.Blurple);
  assert.ok(!embed.image);
  assert.deepEqual(
    embed.fields.map((f) => f.value),
    ["3", "5"],
  );
  assert.deepEqual(edited.attachments, []);
});

test("server event logs have emoji titles, labeled fields, and footers like command logs", async (t) => {
  let sent;
  t.mock.method(Log, "findOne", async () => ({ logChannel: "logs" }));
  mongoose.connection.readyState = 1;
  try {
    await require("../Functions/guildLog").guildLog(
      {
        id: "guild",
        name: "test server",
        channels: {
          cache: new Map([
            [
              "logs",
              {
                id: "logs",
                isSendable: () => true,
                send: async (value) => {
                  sent = value;
                },
              },
            ],
          ]),
        },
      },
      "messages",
      "Message edited",
      "👤 Author: tester",
    );
    const embed = sent.embeds[0].toJSON();
    assert.equal(embed.title, "📝 Message edited 📝");
    assert.equal(embed.color, Colors.Green);
    assert.match(embed.footer.text, /📝/);
    assert.ok(
      embed.fields.some((field) => field.name === "⏲️ Event Recorded:"),
    );
    assert.deepEqual(sent.allowedMentions, { parse: [] });
  } finally {
    mongoose.connection.readyState = 0;
  }
});
