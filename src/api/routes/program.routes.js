const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Program routes - TODO: Implement program logic'
  });
});

module.exports = router; 