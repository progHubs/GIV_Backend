const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Donor routes - TODO: Implement donor logic'
  });
});

module.exports = router; 