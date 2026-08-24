const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    short: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Short",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

saveSchema.index({ user: 1, short: 1 }, { unique: true });

const Save = mongoose.model("Save", saveSchema);
module.exports = Save;
