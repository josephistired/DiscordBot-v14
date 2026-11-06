const mongoose = require("mongoose");
const Account = require("../Schemas/economy");
const MAX_BALANCE = 1_000_000_000;
const SHOP = Object.freeze({
  cookie: { name: "Cookie", price: 25 },
  trophy: { name: "Trophy", price: 1000 },
});
function amount(value) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > MAX_BALANCE)
    throw new Error("Amount must be a whole number from 1 to 1,000,000,000.");
  return value;
}
async function account(Guild, User, session) {
  await Account.init();
  try {
    await Account.updateOne(
      { Guild, User },
      { $setOnInsert: { Guild, User } },
      { upsert: true, session },
    );
  } catch (error) {
    if (error.code !== 11000 || session) throw error;
  }
  return Account.findOne({ Guild, User }).session(session ?? null);
}
async function reward(Guild, User, kind, now = new Date()) {
  await account(Guild, User);
  const daily = kind === "daily";
  if (!daily && kind !== "work") throw new Error("Unknown reward");
  const field = daily ? "dailyAt" : "workAt";
  const wait = daily ? 86400000 : 3600000;
  const coins = daily ? 250 : 50;
  const result = await Account.findOneAndUpdate(
    {
      Guild,
      User,
      wallet: { $lte: MAX_BALANCE - coins },
      $or: [
        { [field]: null },
        { [field]: { $lte: new Date(now.getTime() - wait) } },
      ],
    },
    { $inc: { wallet: coins }, $set: { [field]: now } },
    { new: true },
  );
  if (!result)
    throw new Error(
      `Reward unavailable. ${daily ? "Daily rewards reset after 24 hours" : "Work is available once per hour"}; your wallet must also have room.`,
    );
  return coins;
}
async function move(Guild, User, value, deposit) {
  amount(value);
  await account(Guild, User);
  const from = deposit ? "wallet" : "bank";
  const to = deposit ? "bank" : "wallet";
  const result = await Account.findOneAndUpdate(
    {
      Guild,
      User,
      [from]: { $gte: value },
      [to]: { $lte: MAX_BALANCE - value },
    },
    { $inc: { [from]: -value, [to]: value } },
    { new: true },
  );
  if (!result)
    throw new Error(
      "Insufficient funds or the destination balance limit would be exceeded.",
    );
  return result;
}
async function pay(Guild, User, recipient, value) {
  amount(value);
  if (User === recipient) throw new Error("You cannot pay yourself.");
  // MongoDB transactions prevent losing or duplicating money across two accounts.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await account(Guild, User, session);
      await account(Guild, recipient, session);
      const debit = await Account.updateOne(
        { Guild, User, wallet: { $gte: value } },
        { $inc: { wallet: -value } },
        { session },
      );
      if (debit.modifiedCount !== 1)
        throw new Error("Insufficient wallet funds.");
      const credit = await Account.updateOne(
        { Guild, User: recipient, wallet: { $lte: MAX_BALANCE - value } },
        { $inc: { wallet: value } },
        { session },
      );
      if (credit.modifiedCount !== 1)
        throw new Error("The recipient wallet limit would be exceeded.");
    });
  } finally {
    await session.endSession();
  }
}
async function buy(Guild, User, id) {
  const item = Object.hasOwn(SHOP, id) ? SHOP[id] : null;
  if (!item) throw new Error("Unknown shop item.");
  await account(Guild, User);
  const result = await Account.findOneAndUpdate(
    { Guild, User, wallet: { $gte: item.price } },
    { $inc: { wallet: -item.price, [`inventory.${id}`]: 1 } },
    { new: true },
  );
  if (!result) throw new Error("You do not have enough coins.");
  return item;
}
async function grant(Guild, User, value) {
  amount(value);
  await account(Guild, User);
  const result = await Account.findOneAndUpdate(
    { Guild, User, wallet: { $lte: MAX_BALANCE - value } },
    { $inc: { wallet: value } },
    { new: true },
  );
  if (!result) throw new Error("Wallet limit would be exceeded.");
}
module.exports = {
  account,
  amount,
  reward,
  move,
  pay,
  buy,
  grant,
  SHOP,
  MAX_BALANCE,
};
