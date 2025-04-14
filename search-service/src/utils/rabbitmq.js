import amqp from "amqplib";
import logger from "./logger.js";
const rabbitmqUrl = process.env.RABBITMQ_URL;

let connection = null;
let channel = null;

const EXCHANGE_NAME = "facebook_events";
async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to RabbitMQ");
    return channel;
  } catch (error) {
    logger.error("Error connecting to RabbitMQ:", error);
  }
}

async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectToRabbitMQ();
  }
  const q = await channel.assertQueue("", { exclusive: true });
  channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      callback(content);
      channel.ack(msg);
    }
  });
  logger.info(`subscribed to event : ${routingKey}`);
}
export { connectToRabbitMQ, consumeEvent };
