const mongoose = require("mongoose");
const Cuisine = require("../model/Cuisine");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    description: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    cuisine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Cuisine,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Recipe", recipeSchema);
