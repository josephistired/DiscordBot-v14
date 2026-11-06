const { createSocialCommand } = require("../../../Functions/socialCommand");
const model = require("../../../Schemas/cuddle");

module.exports = createSocialCommand({
  name: "cuddle",
  past: "cuddled",
  model,
});
