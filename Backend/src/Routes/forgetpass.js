const nodemailer = require('nodemailer');
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../Models/User'); // Import the User model
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const router = express.Router();

// Temporary storage for OTPs (in production, use a database)
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Route to generate and send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Store OTP with an expiration time (e.g., 5 minutes)
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  // Send OTP email
  try {
    await transporter.sendMail({
      from: `"Lafefny" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP for password reset is: ${otp}`,
    });
    res.status(200).json({ message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP.', error });
  }
});

// Route to verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = otpStore[email];
  if (!storedOtp) {
    return res.status(400).json({ message: 'No OTP found for this email.' });
  }

  // Check if OTP matches and hasn't expired
  if (storedOtp.otp === parseInt(otp) && Date.now() < storedOtp.expiresAt) {
    delete otpStore[email]; // OTP can only be used once
    res.status(200).json({ message: 'OTP verified.' });
  } else {
    res.status(400).json({ message: 'Invalid or expired OTP.' });
  }
});

// Function to update user password
const updateUserPassword = async (email, newPassword) => {
  return User.findOneAndUpdate({ email }, { password: newPassword });
};

// Route to reset password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    await updateUserPassword(email, newPassword);
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password.', err });
  }
});

module.exports = router;
