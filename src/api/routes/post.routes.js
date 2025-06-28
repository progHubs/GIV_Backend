const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Post routes - TODO: Implement post logic'
  });
});

module.exports = router; 