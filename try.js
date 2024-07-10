const axios = require('axios');
const config = require('./config');

// Send a SMS message to a specified phone number
axios.get(`https://sms.arkesel.com/sms/api?action=send-sms&api_key=Z0dIcXBFak15ZXpHQkVIeW9nUm4&to=233551305822&from=CropScope&sms=The soil moisture level of your farm is too low, please water it.The moisture level is 70`)
.then((response) => {console.log(response.data)})