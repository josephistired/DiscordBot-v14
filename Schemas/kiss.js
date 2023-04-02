const mongoose = require("mongoose");

const kissSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  targetId: { type: String, required: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("Kiss", kissSchema);
