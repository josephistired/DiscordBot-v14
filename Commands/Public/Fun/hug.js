const { createSocialCommand } = require("../../../Functions/socialCommand");
const model = require("../../../Schemas/hug");

module.exports = createSocialCommand({ name: "hug", past: "hugged", model });
