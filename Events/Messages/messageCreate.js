const { Events } = require("discord.js");
const { enforceAntiLink } = require("../../Functions/antiLink");
module.exports = { name: Events.MessageCreate, execute: enforceAntiLink };
