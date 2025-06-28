const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Partner routes - TODO: Implement partner logic'
  });
});

module.exports = router; 