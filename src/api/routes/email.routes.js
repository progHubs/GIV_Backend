const express = require('express');
const emailService = require('../../services/email.service.js');

const router = express.Router();

// Test endpoint: Send a test email using Resend (for development/testing only)
router.post('/send', async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ success: false, error: 'to, subject, and html are required' });
  }
  const result = await emailService.sendWithResend({ to, subject, html });
  if (result.success) {
    return res.status(200).json({ success: true, message: 'Email sent', data: result.data });
  } else {
    return res.status(500).json({ success: false, error: result.error?.message || 'Failed to send email' });
  }
});

module.exports = router;
