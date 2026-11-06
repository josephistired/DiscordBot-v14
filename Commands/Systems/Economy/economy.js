const { SlashCommandBuilder, InteractionContextType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("economy")
    .setDescription("Server-specific coins, bank, and shop")
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((options) =>
      options
        .setName("balance")
        .setDescription("View wallet and bank balances")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("Member to view")
            .setRequired(false),
        ),
    )
    .addSubcommand((options) =>
      options.setName("daily").setDescription("Claim 250 coins once per day"),
    )
    .addSubcommand((options) =>
      options.setName("work").setDescription("Earn 50 coins once per hour"),
    )
    .addSubcommand((options) =>
      options
        .setName("leaderboard")
        .setDescription("View the richest members in this server"),
    )
    .addSubcommand((options) =>
      options.setName("shop").setDescription("View the server coin shop"),
    )
    .addSubcommand((options) =>
      options.setName("inventory").setDescription("View your purchased items"),
    )
    .addSubcommand((options) =>
      options
        .setName("deposit")
        .setDescription("Move wallet coins into the bank")
        .addIntegerOption((options) =>
          options
            .setName("amount")
            .setDescription("Number of coins")
            .setMinValue(1)
            .setMaxValue(1000000000)
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("withdraw")
        .setDescription("Move bank coins into the wallet")
        .addIntegerOption((options) =>
          options
            .setName("amount")
            .setDescription("Number of coins")
            .setMinValue(1)
            .setMaxValue(1000000000)
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("pay")
        .setDescription("Pay another member from your wallet")
        .addUserOption((options) =>
          options.setName("user").setDescription("Recipient").setRequired(true),
        )
        .addIntegerOption((options) =>
          options
            .setName("amount")
            .setDescription("Number of coins")
            .setMinValue(1)
            .setMaxValue(1000000000)
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("grant")
        .setDescription("Admin: grant coins to a member")
        .addUserOption((options) =>
          options.setName("user").setDescription("Recipient").setRequired(true),
        )
        .addIntegerOption((options) =>
          options
            .setName("amount")
            .setDescription("Number of coins")
            .setMinValue(1)
            .setMaxValue(1000000000)
            .setRequired(true),
        ),
    )
    .addSubcommand((options) =>
      options
        .setName("buy")
        .setDescription("Buy a collectible")
        .addStringOption((options) =>
          options
            .setName("item")
            .setDescription("Shop item")
            .setRequired(true)
            .addChoices(
              { name: "Cookie", value: "cookie" },
              { name: "Trophy", value: "trophy" },
            ),
        ),
    ),
};
