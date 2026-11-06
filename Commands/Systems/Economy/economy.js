const {
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const Account = require("../../../Schemas/economy");
const economy = require("../../../Functions/economy");
const data = new SlashCommandBuilder()
  .setName("economy")
  .setDescription("Server-specific coins, bank, and shop")
  .setContexts(InteractionContextType.Guild);
for (const [name, description] of Object.entries({
  balance: "View wallet and bank balances",
  daily: "Claim 250 coins once per day",
  work: "Earn 50 coins once per hour",
  leaderboard: "View the richest members in this server",
  shop: "View the server coin shop",
  inventory: "View your purchased items",
})) {
  data.addSubcommand((s) => {
    s.setName(name).setDescription(description);
    if (name === "balance")
      s.addUserOption((o) =>
        o.setName("user").setDescription("Member to view"),
      );
    return s;
  });
}
for (const name of ["deposit", "withdraw", "pay", "grant"])
  data.addSubcommand((s) => {
    s.setName(name).setDescription(
      {
        deposit: "Move wallet coins into the bank",
        withdraw: "Move bank coins into the wallet",
        pay: "Pay another member from your wallet",
        grant: "Admin: grant coins to a member",
      }[name],
    );
    if (name === "pay" || name === "grant")
      s.addUserOption((o) =>
        o.setName("user").setDescription("Recipient").setRequired(true),
      );
    return s.addIntegerOption((o) =>
      o
        .setName("amount")
        .setDescription("Number of coins")
        .setMinValue(1)
        .setMaxValue(economy.MAX_BALANCE)
        .setRequired(true),
    );
  });
data.addSubcommand((s) =>
  s
    .setName("buy")
    .setDescription("Buy a collectible")
    .addStringOption((o) =>
      o
        .setName("item")
        .setDescription("Shop item")
        .setRequired(true)
        .addChoices(
          ...Object.entries(economy.SHOP).map(([value, item]) => ({
            name: item.name,
            value,
          })),
        ),
    ),
);
module.exports = {
  data,
  // These subcommands share one implementation rather than separate files.
  handlesSubcommands: true,
  async execute(i) {
    await i.deferReply({ flags: MessageFlags.Ephemeral });
    const action = i.options.getSubcommand();
    const guild = i.guildId;
    const user = i.user.id;
    try {
      const recipient = i.options.getUser("user");
      let text;
      if (["pay", "grant"].includes(action)) {
        if (
          action === "grant" &&
          !i.memberPermissions.has(PermissionFlagsBits.ManageGuild)
        )
          throw new Error(
            "Manage Server permission is required to grant coins.",
          );
        if (recipient.bot) throw new Error("Choose a human member.");
        await i.guild.members.fetch(recipient.id);
      }
      switch (action) {
        case "balance": {
          const a = await economy.account(guild, recipient?.id ?? user);
          text = `Wallet: ${a.wallet} coins\nBank: ${a.bank} coins`;
          break;
        }
        case "daily":
        case "work":
          text = `You earned ${await economy.reward(guild, user, action)} coins.`;
          break;
        case "deposit":
        case "withdraw": {
          const a = await economy.move(
            guild,
            user,
            i.options.getInteger("amount"),
            action === "deposit",
          );
          text = `Wallet: ${a.wallet} coins\nBank: ${a.bank} coins`;
          break;
        }
        case "pay":
          await economy.pay(
            guild,
            user,
            recipient.id,
            i.options.getInteger("amount"),
          );
          text = `Paid ${recipient.username} ${i.options.getInteger("amount")} coins.`;
          break;
        case "grant":
          await economy.grant(
            guild,
            recipient.id,
            i.options.getInteger("amount"),
          );
          text = `Granted ${i.options.getInteger("amount")} coins to ${recipient.username}.`;
          break;
        case "shop":
          text = Object.entries(economy.SHOP)
            .map(([id, item]) => `${id}: ${item.price} coins`)
            .join("\n");
          break;
        case "buy":
          text = `Purchased ${(await economy.buy(guild, user, i.options.getString("item"))).name}.`;
          break;
        case "inventory": {
          const a = await economy.account(guild, user);
          text =
            [...a.inventory.entries()]
              .map(([id, count]) => `${id}: ${count}`)
              .join("\n") || "Your inventory is empty.";
          break;
        }
        case "leaderboard": {
          const rows = await Account.aggregate([
            { $match: { Guild: guild } },
            { $project: { User: 1, total: { $add: ["$wallet", "$bank"] } } },
            { $sort: { total: -1, User: 1 } },
            { $limit: 10 },
          ]);
          text =
            rows
              .map((r, n) => `${n + 1}. <@${r.User}>: ${r.total} coins`)
              .join("\n") || "No accounts yet.";
          break;
        }
      }
      await i.editReply({ content: text, allowedMentions: { parse: [] } });
    } catch (error) {
      const known =
        /Amount|cannot pay|Reward unavailable|Insufficient|limit|enough coins|permission|human member/i.test(
          error.message,
        );
      if (!known) console.error("Economy operation failed:", error);
      await i.editReply({
        content: known
          ? error.message
          : "Economy operation failed. Transfers require MongoDB Atlas or a replica set with transaction support.",
        allowedMentions: { parse: [] },
      });
    }
  },
};
