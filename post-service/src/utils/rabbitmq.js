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
async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published : ${routingKey}`);
}

export { connectToRabbitMQ, publishEvent };
