const mqtt = require('mqtt');
require('dotenv').config()


const options = {
    port: process.env.mqtt_broker_port,
    host: process.env.mqtt_broker_host,
    protocol: process.env.mqtt_broker_protocol,
    username: process.env.mqtt_broker_username,
    password: process.env.mqtt_broker_password 
};

// Kết nối đến broker
const client = mqtt.connect(options);

client.on('connect', () => {
    client.subscribe('#', (err) => {
        if(!err) console.log("connected mqtt");
        else console.log("error")
    });
});

module.exports = client;