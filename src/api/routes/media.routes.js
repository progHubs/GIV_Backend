const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Media routes - TODO: Implement media logic'
  });
});

module.exports = router; 