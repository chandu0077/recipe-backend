const express = require("express");
const verify = require("../middleware/privateRoute");

const router = express.Router();

const { getCuisines, createACuisine } = require("../Controller/cuisine");

router.get("/", verify, getCuisines);


router.post("/", verify, createACuisine);

module.exports = router;
