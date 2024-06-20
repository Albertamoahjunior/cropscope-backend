// controllers/farmerController.js
const Farmer = require('../models/Farmer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const config = require('../config'); // Ensure this path is correct

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '30d' });
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const farmer = await Farmer.findOne({ email });

    if (!farmer || !(await farmer.matchPassword(password))) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    res.json({
      _id: farmer._id,
      fullName: farmer.fullName,
      email: farmer.email,
      token: generateToken(farmer._id),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Forgot password controller
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const farmer = await Farmer.findOne({ email });

    if (!farmer) {
      return res.status(400).json({ msg: 'Farmer does not exist' });
    }

    const resetToken = jwt.sign({ farmerId: farmer._id }, config.jwtSecret, { expiresIn: '30m' });

    const transporter = nodemailer.createTransport({
      service: config.emailService.service,
      auth: {
        user: config.emailService.auth.user,
        pass: config.emailService.auth.pass,
      },
    });

    const mailOptions = {
      from: 'your_email@example.com',
      to: email,
      subject: 'CropScope Password Reset',
      html: `
        <p>You requested a password reset for your CropScope account.</p>
        <p>Click <a href="http://localhost:3000/reset-password/${resetToken}">here</a> to reset your password.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
      }
      console.log('Message sent: %s', info.messageId);
      res.status(200).json({ msg: 'Email sent successfully' });
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reset password controller
exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, config.jwtSecret);
    const farmer = await Farmer.findById(decoded.farmerId);

    if (!farmer) {
      return res.status(400).json({ msg: 'Invalid token or farmer does not exist' });
    }

    farmer.password = newPassword;
    await farmer.save();

    res.status(200).json({ msg: 'Password reset successfully' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Data analysis controller (protected route)
exports.dataAnalysis = async (req, res) => {
  // Placeholder for data analysis logic
  // Implement your data analysis code here

  res.status(200).json({ msg: 'Data analysis performed successfully' });
};
