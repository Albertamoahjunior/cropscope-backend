// controllers/adminController.js
const Admin = require('../models/Admin');
const Farmer = require('../models/Farmer');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const smsapikey = 'Z0dIcXBFak15ZXpHQkVIeW9nUm4';
const axios = require('axios');

//function to send  a text message to new farmers
const newFarmer = (phone, farmer_name, password) =>{
   axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=Hello ${farmer_name} !Thank you for choosing cropscope! This is your default password: ${password} . You are advised to change the password. Enjoy a bountiful farm`)
  .then((response) => {console.log(response.data)})
}

const updatedFarmer = (phone, farmer_name) =>{
   axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=Hello ${farmer_name} !Thank you for choosing cropscope!  Enjoy a bountiful farm`)
  .then((response) => {console.log(response.data)})
}

// Admin signup
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });

    if (admin) {
      return res.status(400).json({ msg: 'Admin already exists' });
    }

    admin = new Admin({
      email,
      password,
    });

    await admin.save();

    const payload = {
      user: {
        id: admin.id,
      },
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Admin login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: admin.id,
      },
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    console.log(`secret key:${config.jwtSecret}`);
    res.status(500).send('Server Error');
  }
};

// Admin forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ msg: 'Admin does not exist' });
    }

    // Generate token for password reset
    const resetToken = jwt.sign(
      { adminId: admin.id },
      config.jwtSecret,
      { expiresIn: '30m' }
    );

    // Email service setup (nodemailer)
    const transporter = nodemailer.createTransport({
      host: config.emailService.service,
      port: config.emailService.port,
      secure: false,
      auth: {
        user: config.emailService.auth.user,
        pass: config.emailService.auth.pass,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Cropscope" ${config.emailService.auth.user}`,
      to: email,
      subject: 'CropScope Password Reset',
      html: `
        <p>You requested a password reset for your CropScope account.</p>
        <p>Click <a href="https://cropscope-webapp-frontend.vercel.app/admin/reset-password/${resetToken}">here</a> to reset your password.</p>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
      }
      console.log('Message sent: %s', info.messageId);
      return res.status(200).json({ msg: 'Email sent successfully' });
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server error' });
  }
};


// Admin reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ msg: 'Token or password missing' });
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(token, config.jwtSecret);
    const adminId = decoded.adminId;

    let admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Save admin with new password
    await admin.save();

    res.json({ msg: 'Password reset successful' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Admin list farmers
exports.listFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password');
    res.json(farmers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Admin add farmer
exports.addFarmer = async (req, res) => {
  const { fullName, email, password, location, phone} = req.body;

  try {
    let farmer = await Farmer.findOne({ email });

    if (farmer) {
      return res.status(400).json({ msg: 'Farmer already exists' });
    }

    farmer = new Farmer({
      fullName,
      email,
      password,
      location,
      phone,
    });

    await farmer.save();
    newFarmer(phone, fullName, password);

    res.json({ id: farmer._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

//Admin update farmer
exports.updateFarmer = async (req, res) => {
  const { fullName, email, password, location, phone} = req.body;

  try {
    let farmer = await Farmer.findOne({ email });

    if (!farmer) {
      return res.status(400).json({ msg: 'Farmer does not exists' });
    }

    farmer.fullName = fullName;
    farmer.email = email;
    farmer.password = password;
    farmer.location = location;
    farmer.phone = phone;
  

    await farmer.save();
    updatedFarmer(phone, fullName);

    res.json("Farmer updated Successfully");
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Admin remove farmer
exports.removeFarmer = async (req, res) => {
  const { id } = req.params;

  try {
    let farmer = await Farmer.removeFarmer(id);

    res.status(200).send(farmer);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
