const express = require("express");
const router = express.Router();
const verify = require("../middleware/privateRoute");
const {
  getUser,
  getUserFavouriteCuisine,
  getUserFavouriteRecipes,
  getCuisineFeed,
  addFavRecipe,
  deleteFavRecipe,
  Register,
  Login,
  RefreshToken,
  AddCuisine,
} = require("../Controller/auth");

router.get("/", verify, getUser);

router.get("/fav-cuisines", verify, getUserFavouriteCuisine);

router.get("/fav-recipes",verify,getUserFavouriteRecipes);

router.get("/get-cuisine-feed", verify, getCuisineFeed);

router.post("/add-fav-recipe/:id", verify, addFavRecipe);

router.delete("/del-fav-recipe/:id", verify, deleteFavRecipe);

router.post("/register", Register);
router.post("/login", Login);
router.post("/refresh", RefreshToken);
router.post("/add-cuisine", verify, AddCuisine);

module.exports = router;
