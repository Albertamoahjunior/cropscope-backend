// controllers/farmerController.js
const Farmer = require('../models/Farmer');
const axios = require('axios');
const Recommendations = require('../models/Recommendations');
const Analytics = require('../models/Analytics');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const config = require('../config'); // Ensure this path is correct

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '30d' });
};

//send message concerning critical conditions
//message for critical temperature
const atmosphericTemperatureHigh = (temperature, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The atmospheric temperature of your farm is too high, please water it.The temperature is ${temperature}`)
  .then((response) => {console.log(response.data)})
}

//message for critical temperature
const atmosphericTemperatureLow = (temperature, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The atmospheric temperature of your farm is too low, please do  not water it.The temperature is ${temperature}`)
  .then((response) => {console.log(response.data)})
}

//message for critical moisture level low
const soilMoisturelow = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The soil moisture level of your farm is too low, please water it.The moisture level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

//message for critical moisture level High
const soilMoistureHigh = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The soil moisture level of your farm is too high, please do not water it.The moisture level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

//message for critical humidity
const atmosphericHumidityHigh = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The atmospheric humdity level of your farm is too high, please do not water it.The humidity level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

const atmosphericHumidityLow = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The soil moisture level of your farm is too low, please do not water it.The humidity level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

const soilPhLow = (soilpH, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The soil pH of your farm is too low, please do not water it.The moisture level is ${soilpH}`)
  .then((response) => {console.log(response.data)})
}

const soilPhHigh= (soilpH, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=S3NnaHVHTXZsd1BuRE53SUtNaGg&to=${phone}&from=CropScope&sms=The soil pH of your farm is too high, please do not water it.The moisture level is ${soilpH}`)
  .then((response) => {console.log(response.data)})
}

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
      location: farmer.location,
      phone: farmer.phone,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updatePhone = async (req, res) => {
  const { id, phone } = req.body;

  try {
    const farmer = await Farmer.findOne({id});

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    farmer.phone = phone;

    await farmer.save();

    res.json({ msg: 'Phone updated' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}

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
      host: config.emailService.service,
      port: config.emailService.port,
      secure: false,
      auth: {
        user: config.emailService.auth.user,
        pass: config.emailService.auth.pass,
      },
    });

    const mailOptions = {
    from: `"Cropscope" ${ config.emailService.auth.user}`,
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
   const {id, atmosphericHumidity, atmosphericTemperature, soilMoisture, soilPH} = req.body;
   let farmer_phone = "";
   try {
    const farmer = await Farmer.findOne({id});
    farmer_phone = await farmer.phone;

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    //collect the data required for analytics from GCP using the farmer id
    const newAnalytics = new Analytics();
    newAnalytics._id = id;
    newAnalytics.timestamp = Date.now();
    newAnalytics.atmosphericTemperature = atmosphericTemperature;
    newAnalytics.atmosphericHumidity = atmosphericHumidity;
    newAnalytics.soilMoisture = soilMoisture;
    newAnalytics.soilPH = soilPH;

    newAnalytics.save()
    .then(() => res.status(200).send("analytics saved successfully"))
    .catch(() => res.status(400).send("analytics saved failed"))

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

//fetch data Analytics
exports.fetchDataAnalytics = async (req, res) => {
  const {id} = req.params;
   try {
    const farmer = await Farmer.findOne({id});

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    //collect the data required for analytics from GCP using the farmer id
    const analytics = await Analytics.findById(id);

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};



//controller to overview data
exports.fetchOverviewData = async (req, res) => {
  const {id} = req.params;
   try {
    const farmer = await Farmer.findOne({id});

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    //collect the data required for overview from GCP using the farmer id

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


//controller to fetch recommendations
exports.recommendations = async (req, res) => {
  const {id, time, recommendation} = req.body;
   try {
    const farmer = await Farmer.findOne({id});

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    const newRecommendation =  new Recommendations()
    newRecommendations._id = id;
    newRecommendations.timestamp = time;
    newRecommendations.recommendations = recommendation;

    newRecommendations.save()
    .then(() => res.status(200).send("recommendations saved successfully"))
    .catch(() => res.status(400).send("recommendations saved failed"))

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


exports.fetchRecommendations = async (req, res) => {
  const {id} = req.params;
   try {
    const farmer = await Farmer.findOne({id});

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    //collect the data required for recommendations from GCP using the farmer id

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
