const { model, Schema } = require("mongoose");

module.exports = model(
  "polls",
  new Schema({
    User: String,
    Voted: Boolean,
  })
);
