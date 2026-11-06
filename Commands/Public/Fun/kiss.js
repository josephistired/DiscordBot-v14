const { createSocialCommand } = require("../../../Functions/socialCommand");
const model = require("../../../Schemas/kiss");

module.exports = createSocialCommand({ name: "kiss", past: "kissed", model });
