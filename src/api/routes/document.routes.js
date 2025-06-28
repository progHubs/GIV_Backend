const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Document routes - TODO: Implement document logic'
  });
});

module.exports = router; 