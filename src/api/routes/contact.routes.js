const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact routes - TODO: Implement contact logic'
  });
});

module.exports = router; 