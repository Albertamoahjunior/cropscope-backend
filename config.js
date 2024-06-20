require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  emailService: {
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
};
