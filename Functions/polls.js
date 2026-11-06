const Poll = require("../Schemas/poll");
async function recordVote(
  Guild,
  Message,
  User,
  answer,
  initial = { yes: 0, no: 0 },
) {
  if (!/^\d{17,20}$/.test(User) || !["Yes", "No"].includes(answer))
    throw new Error("Invalid vote");
  await Poll.init();
  // Older button polls are adopted with their displayed totals, but their pre-upgrade voter identities are unknowable.
  try {
    await Poll.updateOne(
      { Guild, Message },
      { $setOnInsert: { Guild, Message, yes: initial.yes, no: initial.no } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  const result = await Poll.findOneAndUpdate(
    { Guild, Message, [`votes.${User}`]: { $exists: false } },
    {
      $set: { [`votes.${User}`]: answer },
      $inc: { [answer === "Yes" ? "yes" : "no"]: 1 },
    },
    { new: true },
  );
  return {
    counted: Boolean(result),
    poll: result ?? (await Poll.findOne({ Guild, Message })),
  };
}
module.exports = { recordVote };
