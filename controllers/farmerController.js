// controllers/farmerController.js
const Farmer = require('../models/Farmer');
const axios = require('axios');
const Recommendations = require('../models/Recommendations');
const Analytics = require('../models/Analytics');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const config = require('../config'); 
const simple_recommend = require('./simpleRecommendation');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: '3d' });
};

const smsapikey = "SHpBTVVHcFpOZWplQWRaenFXRVI"

//send message concerning critical conditions
//message for critical temperature
const atmosphericTemperatureHigh = (temperature, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The atmospheric temperature of your farm is too high, please water it.The temperature is ${temperature}`)
  .then((response) => {console.log(response.data)})
}

//message for critical temperature
const atmosphericTemperatureLow = (temperature, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The atmospheric temperature of your farm is too low, please do  not water it.The temperature is ${temperature}`)
  .then((response) => {console.log(response.data)})
}

//message for critical moisture level low
const soilMoisturelow = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The soil moisture level of your farm is too low, please water it.The moisture level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

//message for critical moisture level High
const soilMoistureHigh = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The soil moisture level of your farm is too high, please do not water it.The moisture level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

//message for critical humidity
const atmosphericHumidityHigh = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The atmospheric humdity level of your farm is too high, please do not water it.The humidity level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

const atmosphericHumidityLow = (moistureLevel, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The soil moisture level of your farm is too low, please do not water it.The humidity level is ${moistureLevel}`)
  .then((response) => {console.log(response.data)})
}

const soilPhLow = (soilpH, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The soil pH of your farm is too low, please do not water it.The moisture level is ${soilpH}`)
  .then((response) => {console.log(response.data)})
}

const soilPhHigh= (soilpH, phone) => {
  axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=The soil pH of your farm is too high, please do not water it.The moisture level is ${soilpH}`)
  .then((response) => {console.log(response.data)})
}


//function to send a message of update of phone number
const updateFarmer = (phone, farmer_name) =>{
   axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=Hello ${farmer_name}! You just changed your number. Thank you for choosing cropscope!`)
  .then((response) => {console.log(response.data)})
}

const resetPassword = (phone, farmer_name) =>{
   axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${smsapikey}&to=${phone.substring(1)}&from=CropScope&sms=Hello ${farmer_name}! You just changed your password. Thank you for choosing cropscope!`)
  .then((response) => {console.log(response.data)})
}

const ATMOTEMPSLOWTHRESHOLD = 7
const ATMOTEMPHIGHTHRESHOLD =  26
const SOILMOISTURELOWTHRESHOLD = 40
const SOILMOISTUREHIGHTHRESHOLD = 75
const ATMOHUMIDITYLOWTHRESHOLD = 60
const ATMOHUMIDITYHIGHTHRESHOLD = 80
const SOILPHLOWTHRESHOLD = 5.8
const SOILPHHIGHTHRESHOLD = 7.5

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
    const farmer = await Farmer.findOne({_id: id});

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    farmer.phone = phone;

    await farmer.save();
    updateFarmer(phone, farmer.fullName);
    console.log({
      msg: 'Phone updated successfully',
      phone: farmer.phone,
      name: farmer.fullName
    });

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
        <p>Click <a href="https://cropscope-webapp-frontend.vercel.app/farmer/reset-password/${resetToken}">here</a> to reset your password.</p>
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
  const {token} = req.params; 
  const {password} = req.body;

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const farmer = await Farmer.findById(decoded.farmerId);

    if (!farmer) {
      return res.status(400).json({ msg: 'Invalid token or farmer does not exist' });
    }

    farmer.password = password;
    await farmer.save();
    resetPassword(farmer.phone, farmer.fullName);

    res.status(200).json({ msg: 'Password reset successfully' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Controller to add a new recommendation
addRecommendation = async (farmerID) => {

  try {
    const farmer = await Farmer.findOne({ _id: farmerID });

    if (!farmer) {
      return { msg: 'Farmer not found' };
    }

    const averages = await Analytics.getAveragesForToday(farmerID);

    if (!averages) {
      return { msg: 'No analytics data found for today' };
    }

    const { averageSoilMoisture, averageSoilPH, averageAtmosphericTemperature, averageAtmosphericHumidity } = averages;
    const recommendation = simple_recommend(
      averageSoilMoisture,
      averageSoilPH,
      averageAtmosphericTemperature,
      averageAtmosphericHumidity
    );

    const newRecommendation = new Recommendations({
      farmerID,
      condition: recommendation.condition,
      disease: recommendation.disease,
      suggestion: recommendation.suggestions
    });

    await newRecommendation.save();
    return "msg: Recommendation saved successfully";
  } catch (error) {
    return `msg: ${error.message}`;
  }
};


// Data analysis controller (protected route)
exports.dataAnalysis = async (farm_data) => {
  const {farmerID, atmosphericHumidity, atmosphericTemperature, soilMoisture, soilPH} = farm_data;
   try {
      const farmer = await Farmer.findOne({_id: farmerID});
      
      // Ensure the farmer object exists before accessing its properties
      if (!farmer) {
        throw new Error("Farmer not found");
      }

      const farmer_phone = farmer.phone;

      // Alert for humidityconst mongoose = require('mongoose');  
      if (atmosphericHumidity < ATMOHUMIDITYLOWTHRESHOLD) {
        atmosphericHumidityLow(atmosphericHumidity, farmer_phone);
      } else if (atmosphericHumidity > ATMOHUMIDITYHIGHTHRESHOLD) {
        atmosphericHumidityHigh(atmosphericHumidity, farmer_phone);
      }

      // Alert for temperature
      if (atmosphericTemperature < ATMOTEMPSLOWTHRESHOLD) {
        atmosphericTemperatureLow(atmosphericTemperature, farmer_phone);
      } else if (atmosphericTemperature > ATMOTEMPHIGHTHRESHOLD) {
        atmosphericTemperatureHigh(atmosphericTemperature, farmer_phone);
      }

      // Alert for soil moisture
      if (soilMoisture < SOILMOISTURELOWTHRESHOLD) {
        soilMoisturelow(soilMoisture, farmer_phone);
      } else if (soilMoisture > SOILMOISTUREHIGHTHRESHOLD) {
        soilMoistureHigh(soilMoisture, farmer_phone);
      }

      // Alert for soil pH
      if (soilPH < SOILPHLOWTHRESHOLD) {
        soilPhLow(soilPH, farmer_phone);
      } else if (soilPH > SOILPHHIGHTHRESHOLD) {
        soilPhHigh(soilPH, farmer_phone);
      }

    const newAnalytics = new Analytics({
      farmerID: farmerID,
      atmosphericTemperature: atmosphericTemperature,
      atmosphericHumidity: atmosphericHumidity,
      soilMoisture: soilMoisture,
      soilPH: soilPH,
    });

    newAnalytics.save()
      .then(() => {
        console.log('Analytics saved successfully')
      })
      .catch(err => console.error('Error saving analytics:', err));

      let new_recommend = await addRecommendation(farmerID);
      console.log(new_recommend);
   }
    
  catch (error) {
    console.error(error.message);
    return 'Server Error';
  }
};

//fetch data Analytics
exports.fetchDataAnalytics = async (req, res) => {
  const {id, timeframe} = req.body;
   try {
    const farmer = await Farmer.findById(id);

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    //collect the data analytics
    switch(timeframe){
      case 'today':
      const todayAnalytics = await Analytics.getToday(id)
      res.json(todayAnalytics);
      break;
      case 'week':
        const weekAnalytics = await Analytics.getAveragesForWeek(id)
        res.json(weekAnalytics);
      break;
      case 'month':
      const monthAnalytics = await Analytics.getAveragesForMonth(id)
      res.json(monthAnalytics);
      break;
      case 'year':
      const yearAnalytics = await Analytics.getAveragesForYear(id)
      res.json(yearAnalytics);
      break;
      case 'since':
      const sinceAnalytics = await Analytics.getAveragesForEachDay(id)
      res.json(sinceAnalytics);
      break;
    }

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};



//controller to overview data
exports.fetchOverviewData = async (req, res) => {
  const { id } = req.body;
  
  console.log(id);
  try {
    const farmer = await Farmer.findById(id);

    if (!farmer) {
      return res.status(404).json({ msg: 'Farmer not found' });
    }

    // Retrieve the data using the static method on the Analytics model
    const data = await Analytics.getAveragesForToday(id);

    if (!data) {
      return res.status(404).json({ msg: 'No data found for today' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// Controller to fetch recommendations in ascending order
exports.fetchRecommendations = async (req, res) => {
  const farmer_id = req.params.id;
  try {
    const recommendations = await Recommendations.fetchRecommendations(farmer_id);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
