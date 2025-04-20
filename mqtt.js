const mqtt = require('mqtt');

// เชื่อมต่อ MQTT Broker
const mqttClient = mqtt.connect('mqtt:// broker.emqx.io:1883');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');

  // subscribe หัวข้อที่ hardware ส่งข้อมูลมา
  mqttClient.subscribe('sensor/data', (err) => {
    if (!err) {
      console.log('Subscribed to topic: sensor/data');
    }
  });
});

// เมื่อได้รับข้อมูลจาก hardware
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString()); // สมมุติว่า hardware ส่ง JSON มา

    const newData = new SensorData(data);
    await newData.save();

    // broadcast ไปยัง frontend ที่เชื่อม WebSocket
    io.emit('newSensorData', newData);
  } catch (err) {
    console.error('Error parsing or saving data:', err.message);
  }
});
