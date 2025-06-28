const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Donation routes - TODO: Implement donation logic'
  });
});

module.exports = router; 