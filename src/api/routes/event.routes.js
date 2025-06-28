const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event routes - TODO: Implement event logic'
  });
});

module.exports = router; 