const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Testimonial routes - TODO: Implement testimonial logic'
  });
});

module.exports = router; 