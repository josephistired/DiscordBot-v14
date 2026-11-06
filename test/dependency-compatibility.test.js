const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { EventEmitter } = require("node:events");
const { Collection, GatewayIntentBits } = require("discord.js");
const giveawaysRequire = createRequire(require.resolve("discord-giveaways"));
const transcriptsRequire = createRequire(
  require.resolve("discord-html-transcripts"),
);

// Exercise real dependency code; only Discord I/O and storage are replaced.
test(
  "patched giveaway dependencies preserve start, edit, pause, and serialization behavior",
  { timeout: 5000 },
  async () => {
    const Manager = require("../src/giveawayManager");
    const client = new EventEmitter();
    client.options = { intents: [GatewayIntentBits.GuildMessageReactions] };
    client.user = { id: "bot" };
    const manager = new Manager(client, {
      default: {
        embedColor: "#00FF00",
        reaction: "🎉",
        lastChance: { enabled: false },
      },
    });
    manager.ready = true;
    const saved = new Map();
    const edits = [];
    manager.saveGiveaway = async (id, data) => saved.set(id, data);
    manager.editGiveaway = async (id, data) => saved.set(id, data);
    const message = {
      id: "123456789012345678",
      reactions: { cache: new Collection([["🎉", {}]]) },
      react: async () => ({ message }),
      edit: async (payload) => {
        edits.push(payload);
        return message;
      },
    };
    const channel = {
      id: "223456789012345678",
      guildId: "323456789012345678",
      isTextBased: () => true,
      isThread: () => false,
      send: async (payload) => {
        assert.ok(payload.embeds[0].toJSON().description);
        return message;
      },
    };
    const giveaway = await manager.start(channel, {
      prize: "Test Prize",
      duration: 3600000,
      winnerCount: 1,
      exemptMembers: (member) => member.user.bot,
      bonusEntries: [{ bonus: () => 2, cumulative: false }],
      messages: { inviteToParticipate: "Join the test giveaway" },
    });
    assert.equal(giveaway.prize, "Test Prize");
    assert.equal(
      giveaway.messages.inviteToParticipate,
      "Join the test giveaway",
    );
    assert.equal(
      giveaway.messages.giveawayEnded,
      "🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
    );
    assert.equal(typeof saved.get(message.id).exemptMembers, "string");
    assert.equal(typeof saved.get(message.id).bonusEntries, "string");
    const { Giveaway } = require("discord-giveaways");
    const restored = new Giveaway(manager, saved.get(message.id));
    assert.equal(
      await restored.exemptMembersFunction({ user: { bot: true } }),
      true,
    );
    assert.equal(restored.bonusEntries[0].bonus(), 2);
    await manager.edit(message.id, {
      newPrize: "Updated Prize",
      newMessages: { inviteToParticipate: "Updated instructions" },
      newLastChance: { enabled: true, threshold: 10000 },
    });
    assert.equal(giveaway.prize, "Updated Prize");
    assert.equal(giveaway.messages.inviteToParticipate, "Updated instructions");
    assert.equal(giveaway.lastChance.threshold, 10000);
    await manager.pause(message.id);
    assert.equal(giveaway.pauseOptions.isPaused, true);
    await manager.unpause(message.id);
    assert.equal(giveaway.pauseOptions.isPaused, false);
    assert.ok(edits.length >= 3);
  },
);

test("giveaway overrides retain array replacement and bigint serialization contracts", () => {
  const { deepmergeCustom } = giveawaysRequire("deepmerge-ts");
  const serialize = giveawaysRequire("serialize-javascript");
  assert.deepEqual(
    deepmergeCustom({ mergeArrays: false })(
      { winners: ["one"] },
      { winners: ["two"] },
    ),
    { winners: ["two"] },
  );
  assert.equal(serialize(123n), 'BigInt("123")');
});

test("patched transcript HTTP client still downloads image data through the real utility", async () => {
  const { MockAgent, getGlobalDispatcher, setGlobalDispatcher } =
    transcriptsRequire("undici");
  const { downloadImageToDataURL } = transcriptsRequire("./utils/utils.js");
  const previous = getGlobalDispatcher();
  const agent = new MockAgent();
  agent.disableNetConnect();
  agent
    .get("https://assets.example")
    .intercept({ path: "/image.png" })
    .reply(200, Buffer.from("image bytes"), {
      headers: { "content-type": "image/png" },
    });
  setGlobalDispatcher(agent);
  try {
    assert.equal(
      await downloadImageToDataURL("https://assets.example/image.png"),
      "data:image/png;base64,aW1hZ2UgYnl0ZXM=",
    );
    agent.assertNoPendingInterceptors();
  } finally {
    setGlobalDispatcher(previous);
    await agent.close();
  }
});

test("transcripts render message text and attachments with the patched dependency tree", async () => {
  const {
    generateFromMessages,
    ExportReturnType,
  } = require("discord-html-transcripts");
  const channel = {
    id: "channel",
    name: "test-channel",
    type: 0,
    isDMBased: () => false,
    isThread: () => false,
    isVoiceBased: () => false,
    guild: { name: "Test Guild", iconURL: () => null },
    client: {},
  };
  const message = {
    id: "message",
    author: {
      id: "user",
      displayName: "Tester",
      bot: false,
      displayAvatarURL: () => "https://example.com/avatar.png",
    },
    member: null,
    createdAt: new Date("2026-11-06T00:00:00Z"),
    editedAt: null,
    mentions: { everyone: false },
    content: "Dependency compatibility test",
    embeds: [],
    components: [],
    attachments: new Collection(),
    reactions: { cache: new Collection() },
  };
  const html = await generateFromMessages([message], channel, {
    returnType: ExportReturnType.String,
  });
  assert.match(html, /Dependency compatibility test/);
  assert.match(html, /Test Guild/);
  assert.match(html, /Tester/);
  const attachment = await generateFromMessages([], channel, {
    filename: "test-transcript.html",
  });
  assert.equal(attachment.name, "test-transcript.html");
  assert.ok(Buffer.isBuffer(attachment.attachment));
});
