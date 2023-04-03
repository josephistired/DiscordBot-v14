const { model, Schema } = require("mongoose");

module.exports = model(
  "infractions",
  new Schema({
    Guild: String,
    User: String,
    linkCount: {
      type: Number,
      default: 0,
    },
  })
);
