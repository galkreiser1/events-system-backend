import * as amqp from "amqplib";
import UserCoupon from "./models/user_coupons.js";

import { userPublisher } from "./index.js";

import { config } from "./config.js";

const AMQPUSER = process.env.AMQPUSER || config.AMQPUSER;
const AMQPPASS = process.env.AMQPPASS || config.AMQPPASS;

export const consumeMessages = async () => {
  try {
    // connect to RabbitMQ
    const conn = await amqp.connect(
      `amqps://${AMQPUSER}:${AMQPPASS}@sparrow.rmq.cloudamqp.com/eayfadwk`
    );
    const channel = await conn.createChannel();

    // Declare an exchange with a name 'order_exchange' and type 'fanout'.
    // 'fanout' type broadcasts all the messages it receives to all the queues it knows.
    // `{ durable: false }` means the exchange will not survive a broker restart.
    const exchange = "payment_payment_exchange";
    await channel.assertExchange(exchange, "fanout", { durable: false });

    // Declare a queue with a name 'order_queue'. If it doesn't exist, it will be created.
    // `{ durable: false }` here means messages in the queue are stored in memory only, not on disk.
    const queue = "payment_payment_queue";
    await channel.assertQueue(queue, { durable: false });

    // Bind the declared queue to the exchange. This creates a relationship between the exchange and the queue.
    // Messages sent to this exchange will be routed to the queue according to the exchange type and routing rules.
    // The empty string as the third parameter is the routing key, which is ignored by fanout exchanges.
    await channel.bindQueue(queue, exchange, "");

    // Start consuming messages from the queue. The callback function is invoked whenever a message is received.
    // `msg.content.toString()` converts the message content to a string for logging or processing.
    // `channel.ack(msg)` acknowledges the message, indicating it has been processed and can be removed from the queue.
    await channel.consume(queue, (msg) => {
      console.log(`Comsumer >>> received message: ${JSON.parse(msg.content)}`);
      handlePaymentQueue(channel, msg);
    });
  } catch (error) {
    console.log(error.message);
  }
};

const handlePaymentQueue = async (channel: amqp.Channel, msg: amqp.Message) => {
  try {
    const { code, username } = JSON.parse(msg.content);
    const userCoupon = new UserCoupon({ code, username });
    await userCoupon.save();
    console.log(`UserCoupon saved: ${userCoupon}`);
    await userPublisher.sendEvent(JSON.stringify({ username }));
    channel.ack(msg);
  } catch (error) {
    console.log(error.message);
    channel.ack(msg);
  }
};
