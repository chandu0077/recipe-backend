const express = require("express");
const verify = require("../middleware/privateRoute");
const router = express.Router();
const {
  getRecipe,
  createARecipe,
  deleteARecipe,
  updateARecipe,
} = require("../Controller/recipe");

router.get("/", verify, getRecipe);

router.post("/", verify, createARecipe);
router.delete("/:id", verify, deleteARecipe);
router.put("/:id", verify, updateARecipe);

module.exports = router;
