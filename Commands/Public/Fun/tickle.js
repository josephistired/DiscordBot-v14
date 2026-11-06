const { createSocialCommand } = require("../../../Functions/socialCommand");
const model = require("../../../Schemas/tickle");

module.exports = createSocialCommand({
  name: "tickle",
  past: "tickled",
  model,
});
