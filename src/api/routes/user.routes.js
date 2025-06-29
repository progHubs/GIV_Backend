const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get all users endpoint - TODO: Implement user listing logic",
  });
});

module.exports = router;
