const { model, Schema } = require("mongoose");

module.exports = model(
  "cooldown",
  new Schema({
    moderationCooldown: String,
    funCooldown: String,
    utilitiesCooldown: String,
    systemsCooldown: String,
  })
);
