const mongoose = require("mongoose");

const hugSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  targetId: { type: String, required: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("Hug", hugSchema);
