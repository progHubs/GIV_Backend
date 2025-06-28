const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FAQ routes - TODO: Implement FAQ logic'
  });
});

module.exports = router; 