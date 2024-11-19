const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");

  console.log("token",token);
  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      const refreshToken = req.header("refresh-token");
      if (!refreshToken) return res.status(401).send("Access Denied");

      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_SECRET_TOKEN,
        );

        const newAccessToken = generateAccessToken(decoded._id);
        res.setHeader("auth-token", newAccessToken);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).send("Invalid refresh Token");
      }
    } else {
      res.status(401).send("Invalid token!");
    }
  }
};

function generateAccessToken(userId) {
  return jwt.sign({ _id: userId }, process.env.REFRESH_SECRET_TOKEN, {
    expiresIn: "50m",
  });
}
