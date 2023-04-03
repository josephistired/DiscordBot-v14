const { model, Schema } = require("mongoose");

module.exports = model(
  "welcome",
  new Schema({
    Guild: String,
    welcomeChannel: String,
    welcomeMessage: String,
    welcomeColor: String,
    welcomeRole: String,
  })
);
