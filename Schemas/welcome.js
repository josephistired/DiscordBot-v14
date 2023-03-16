const { model, Schema } = require("mongoose");

module.exports = model(
  "welcome",
  new Schema({
    Guild: String,
    WelcomeChannel: String,
    WelcomeMessage: String,
    WelcomeColor: String,
  })
);
