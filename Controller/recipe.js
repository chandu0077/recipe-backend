const Recipe = require("../model/Recipe");

const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.find();
    res.status(200).json(recipe);
  } catch (error) {
    res.status(400).json({ message: err });
  }
};

const createARecipe = async (req, res) => {
  try {
    const newRecipe = Recipe.create({
      title: req.body.title,
      description: req.body.description,
      cuisine: req.body.cuisine,
    });
    if (!newRecipe) {
      throw Error("Something went wrong!!!");
    }
    res.status(200).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteARecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) throw new Error("Something went wrong !!!");
    const deleteARecipe = await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateARecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) throw new Error("Something went wrong !!!");
    const updateARecipe = await Recipe.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      cuisine: req.body.cuisine,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getRecipe,
  createARecipe,
  deleteARecipe,
  updateARecipe,
};
