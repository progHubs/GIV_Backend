const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campaign routes - TODO: Implement campaign logic'
  });
});

module.exports = router; 