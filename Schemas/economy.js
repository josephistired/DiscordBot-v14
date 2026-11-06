const { Schema, model } = require("mongoose");
const schema = new Schema({
  Guild: { type: String, required: true },
  User: { type: String, required: true },
  wallet: { type: Number, default: 0, min: 0 },
  bank: { type: Number, default: 0, min: 0 },
  dailyAt: { type: Date, default: null },
  workAt: { type: Date, default: null },
  inventory: { type: Map, of: Number, default: {} },
});
schema.index({ Guild: 1, User: 1 }, { unique: true });
module.exports = model("economy", schema);
