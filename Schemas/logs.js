const { model, Schema } = require("mongoose");

module.exports = model(
  "log",
  new Schema({
    Guild: String,
    Channel: String,
  })
);
