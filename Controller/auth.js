const { registerValidation, loginValidation } = require("../validation");
const User = require("../model/User");
const mongoose = require("mongoose");
const Cuisine = require("../model/Cuisine");
const Recipe = require("../model/Recipe");
const Likes = require("../model/Likes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function generateAccessToken(userId) {
  return jwt.sign({ _id: userId }, process.env.TOKEN_SECRET);
}

const Register = async (req, res) => {
  const { name, email, password, isAdmin } = req.body.data;
  const { error } = registerValidation(req.body.data);
  if (error) {
    return res.status(400).send({ msg: "Validation failed!!!" });
  }

  const emailExists = await User.findOne({ email: email });
  if (emailExists) {
    return res.status(400).send({ msg: "Email already Exists!!!" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
    isAdmin: isAdmin,
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id, msg: "Registration Successful" });
  } catch (error) {
    res.status(400).send({ msg: "Something went wrong, Try Again!!!" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body.data;
  const { error } = loginValidation(req.body.data);

  if (error) {
    res.status(400).send({ msg: "Validation failed!!!", error });
  }
  const user = await User.findOne({ email: email });
  if (!user) return res.status(400).send({ msg: "Email Already Exists!!!" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).send({ msg: "Email or password is wrong" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  res.json({ accessToken, refreshToken, msg: "Login successful", user: user });
};

const RefreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN);
    const accessToken = generateAccessToken(decoded._id);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).send("Invalid refresh Token!!!");
  }
};

const AddCuisine = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      cuisines: req.body,
    });
    if (!updatedUser) {
      throw new Error("Something went wrong!!!");
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const getUserFavouriteCuisine = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userFavCuisines = await Cuisine.find({
      _id: { $in: user.cuisines },
    });
    res.status(200).json(userFavCuisines);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const getUserFavouriteRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const recipeIds = await Likes.find({
      userId: { $in: user.id },
    });
    const favRecipeIds = [];
    for (let el of recipeIds) {
      favRecipeIds.push(el.recipeId);
    }
    const favRecipes = []
    for (let el of favRecipeIds) {
      const recipe = await Recipe.findById(el);
      favRecipes.push(recipe.title);
    }
    res.status(200).json(favRecipes);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const getCuisineFeed = async (req, res) => {
  const user = await User.findById(req.user._id);
  const cuisineIds = [];
  for (let cuisine of user.cuisines) {
    cuisineIds.push(new mongoose.Types.ObjectId(cuisine));
  }
  const recipeLikes = await Likes.find({
    userId: req.user._id,
  }).distinct("recipeId");

  const recipeIds = [];
  for (let recipeId of recipeLikes) {
    recipeIds.push(new mongoose.Types.ObjectId(recipeId));
  }

  const recipes = await Recipe.aggregate([
    {
      $match: {
        cuisine: {
          $in: cuisineIds,
        },
      },
    },
    {
      $lookup: {
        from: "cuisines",
        localField: "cuisine",
        foreignField: "_id",
        as: "cuisineData",
      },
    },
    {
      $unwind: "$cuisineData",
    },
    {
      $addFields: {
        cuisineName: "$cuisineData.name",
        cuisineId: "$cuisineData._id",
        cuisineCreatedAt: "$cuisineName.createdAt",
      },
    },
    {
      $group: {
        _id: "$cuisineName",
        recipes: {
          $push: {
            createdAt: "$createdAt",
            _id: "$_id",
            cuisineId: "$cuisineId",
            title: "$title",
            description: "$description",
            isFavorite: {
              $cond: {
                if: { $in: ["$_id", recipeIds] },
                then: true,
                else: false,
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        recipes: "$recipes",
      },
    },
    {
      $sort: {
        "recipes.createdAt": -1,
      },
    },
  ]);
  res.status(200).json(recipes);
};

const addFavRecipe = async (req, res) => {
  try {
    const userLikes = Likes.create({
      userId: req.user._id,
      recipeId: req.params.id,
    });
    if (!userLikes) {
      throw new Error("Something Went Wrong!!!");
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const deleteFavRecipe = async (req, res) => {
  try {
    const deletedLike = await Likes.deleteOne({
      recipeId: req.params.id,
      userId: req.user._id,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

function generateRefreshToken(userId) {
  return jwt.sign({ _id: userId }, process.env.REFRESH_SECRET_TOKEN);
}

module.exports = {
  Register,
  Login,
  RefreshToken,
  AddCuisine,
  getUser,
  getUserFavouriteCuisine,
  getCuisineFeed,
  addFavRecipe,
  deleteFavRecipe,
  getUserFavouriteRecipes,
};
