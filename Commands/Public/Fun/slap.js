const { createSocialCommand } = require("../../../Functions/socialCommand");
const model = require("../../../Schemas/slap");

module.exports = createSocialCommand({ name: "slap", past: "slapped", model });
