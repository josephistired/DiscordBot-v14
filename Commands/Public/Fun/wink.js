const { createSocialCommand } = require("../../../Functions/socialCommand");
const model = require("../../../Schemas/wink");

module.exports = createSocialCommand({ name: "wink", past: "winked", model });
