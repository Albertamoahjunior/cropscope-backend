const mqtt = require('mqtt');
const { dataAnalysis } = require('./farmerController');
const config = require('../config');

const subscribeToTopic = () => {
  const clientId = 'cropscope' + Math.random().toString(16).substring(2, 8);
  const username = 'albertlife';
  const password = 'Qsx.123_456';

  let client;
  try {
    client = mqtt.connect('wss://z44662e8.ala.eu-central-1.emqxsl.com:8084/mqtt', {
      clientId,
      username,
      password,
    });
  } catch (err) {
    console.error('MQTT connection error:', err);
  }

  const topic = 'cropscopefarm';
  const qos = 1;

  try {
    client.subscribe(topic, { qos }, (error) => {
      if (error) {
        console.log('Subscribe error:', error);
        return;
      }
      console.log(`Subscribed to topic '${topic}'`);
    });
  } catch (err) {
    console.error('Error subscribing to topic:', err);
  }

  client.on('message', (topic, payload) => {
    try {
      console.log('Received Message:', topic, payload.toString());
      // Convert message to JSON if needed and process
      const jsonMessage = JSON.parse(payload.toString());
      dataAnalysis(jsonMessage); // Ensure this function is correctly defined in farmerController.js
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  client.on('error', (err) => {
    console.log('Connection error:', err);
  });

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
  });

  client.on('close', () => {
    console.log('Connection closed');
  });

  client.on('offline', () => {
    console.log('Client is offline');
  });

  client.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
  });

  return client;
};

module.exports = subscribeToTopic;
