const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const Config = require("../../Schemas/logs");
const { CATEGORIES } = require("../../Functions/guildLog");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("log-options")
    .setDescription("Enable or disable a category of server logs")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) =>
      o
        .setName("event")
        .setDescription("Log category")
        .setRequired(true)
        .addChoices(
          ...["all", ...CATEGORIES].map((value) => ({ name: value, value })),
        ),
    )
    .addBooleanOption((o) =>
      o
        .setName("enabled")
        .setDescription("Enable this log category")
        .setRequired(true),
    ),
  async execute(i) {
    await i.deferReply({ flags: MessageFlags.Ephemeral });
    const event = i.options.getString("event");
    const enabled = i.options.getBoolean("enabled");
    const categories = event === "all" ? CATEGORIES : [event];
    if (categories.some((c) => !CATEGORIES.includes(c)))
      throw new Error("Unknown logging category");
    const update = Object.fromEntries(
      categories.map((c) => [`events.${c}`, enabled]),
    );
    const config = await Config.findOneAndUpdate(
      { Guild: i.guildId },
      { $set: update },
      { new: true },
    );
    await i.editReply(
      config
        ? `${event} logging ${enabled ? "enabled" : "disabled"}.`
        : "Set a logging channel with /log-set first.",
    );
  },
};
