const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Skill routes - TODO: Implement skill logic'
  });
});

module.exports = router; 