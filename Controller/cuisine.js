const Cuisine = require("../model/Cuisine");

const getCuisines = async (req, res) => {
  try {
    const cuisine = await Cuisine.find();
    res.status(200).json(cuisine);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const createACuisine = async (req, res) => {
  try {
    const cuisine = await Cuisine.find({ name: req.body.name });
    if (cuisine.length) {
      throw new Error("Cuisine already exists!!!");
    }
    const newCuisine = Cuisine.create({ name: req.body.name });
    res.status(200).json(newCuisine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = { getCuisines, createACuisine };
