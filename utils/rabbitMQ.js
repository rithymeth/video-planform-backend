const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
  }
}

async function sendToQueue(queue, message) {
  if (!channel) await connectRabbitMQ();
  channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(message));
}

module.exports = { connectRabbitMQ, sendToQueue };
