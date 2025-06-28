const express = require('express');
const router = express.Router();

// Example: Send a test email
router.post('/send', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email send endpoint - TODO: Implement email sending logic',
    data: req.body
  });
});

module.exports = router;
