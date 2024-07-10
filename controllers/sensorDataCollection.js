const mqtt = require('mqtt');
const {dataAnalysis} = require('./farmerController');
const config = require('../config'); 


// Replace with your HiveMQ credentials and TLS URL
const mqttUrl = 'mqtts://119c3601f1db48a19381887555f09c73.s1.eu.hivemq.cloud:8883';

// Create a client instance
const client = mqtt.connect(mqttUrl, {
  clientId: "9b169250-fa57-4f66-aa21-2e3fce8bd4ba",
  username: config.mqttusername || "albertlife",
  password: config.mqttpassword || "Qsx.123_456",
  rejectUnauthorized: false,
  clean:false
});

// Function to handle connection and subscribing
function subscribeToTopic() {
  client.on('connect', function () {
    console.log('Connected to MQTT broker');

    // Subscribe to a topic with QoS 2
    client.subscribe('cropscopefarm', { qos: 2 }, function (err) {
      if (!err) {
        console.log('Subscribed to cropscopefarm broker');
      }
    });
  });

  // Handle incoming messages
  client.on('message', function (topic, message) {
    //convert the message to a json object
    // Given string
    const string_message = message.toString();

    // Convert string to valid JSON format
    const jsonStr = string_message
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
    .replace(/'/g, '"');

    // Parse the JSON string to JavaScript object
    const json_message = JSON.parse(jsonStr);
    
    //store data in database
    dataAnalysis(json_message); // this function should be defined in your farmerController.js file


    console.log(json_message); // Output: { temp: 10, hum: 10 }

  });

  // Handle errors
  client.on('error', function (err) {
    console.error('Error:', err);
  });
}

module.exports = subscribeToTopic;

