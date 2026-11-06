const { model, Schema } = require("mongoose");
module.exports = model(
  "verification",
  new Schema({
    Guild: { type: String, required: true, unique: true },
    channel: { type: String, required: true },
    role: { type: String, required: true },
    message: { type: String, required: true },
    gates: {
      type: Map,
      of: new Schema(
        {
          overwrites: [
            { id: String, type: Number, allow: String, deny: String },
          ],
        },
        { _id: false },
      ),
      default: {},
    },
  }),
);
