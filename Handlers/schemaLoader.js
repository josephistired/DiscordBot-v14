const mongoose = require("mongoose");

// Log the schema names and the number of schemas in the console
function logSchemas() {
  console.time("Schemas Loaded");

  const schemas = mongoose.modelNames();
  const schemaData = schemas.map((schema, index) => ({
    "#": index + 1,
    Schema: schema,
  }));
  console.table(schemaData, ["#", "Schema"]);
  console.info(`\n\x1b[36mLoaded ${schemas.length} schemas.\x1b[0m`);

  console.timeEnd("Schemas Loaded");
}

module.exports = { logSchemas };
