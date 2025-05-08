const { model, Schema } = require("mongoose");

module.exports = model(
  "links",
  new Schema({
    Guild: String,
    discordLinks: Boolean,
    virusLinks: Boolean,
  }),
);
