const { Schema, model } = require("mongoose");
const schema = new Schema({
  Guild: { type: String, required: true },
  Message: { type: String, required: true },
  yes: { type: Number, default: 0 },
  no: { type: Number, default: 0 },
  votes: { type: Map, of: String, default: {} },
});
schema.index({ Guild: 1, Message: 1 }, { unique: true });
module.exports = model("poll", schema);
