import * as amqp from "amqplib";
import User from "./models/user.js";

export const consumeMessages = async () => {
  try {
    // connect to RabbitMQ
    const conn = await amqp.connect(
      "amqps://eayfadwk:dQJ0QpNDB2ihFMPsiPkfEMYba5TL2Oya@sparrow.rmq.cloudamqp.com/eayfadwk"
    );
    const channel = await conn.createChannel();

    // Declare an exchange with a name 'order_exchange' and type 'fanout'.
    // 'fanout' type broadcasts all the messages it receives to all the queues it knows.
    // `{ durable: false }` means the exchange will not survive a broker restart.
    const exchange = "order_user_exchange";
    await channel.assertExchange(exchange, "fanout", { durable: false });

    // Declare a queue with a name 'order_queue'. If it doesn't exist, it will be created.
    // `{ durable: false }` here means messages in the queue are stored in memory only, not on disk.
    const queue = "order_user_queue";
    await channel.assertQueue(queue, { durable: false });

    // Bind the declared queue to the exchange. This creates a relationship between the exchange and the queue.
    // Messages sent to this exchange will be routed to the queue according to the exchange type and routing rules.
    // The empty string as the third parameter is the routing key, which is ignored by fanout exchanges.
    await channel.bindQueue(queue, exchange, "");

    // Start consuming messages from the queue. The callback function is invoked whenever a message is received.
    // `msg.content.toString()` converts the message content to a string for logging or processing.
    // `channel.ack(msg)` acknowledges the message, indicating it has been processed and can be removed from the queue.
    await channel.consume(queue, (msg) => {
      console.log(
        `Comsumer >>> received message: ${JSON.parse(msg.content).username}`
      );
      handleOrderUserQueue(channel, msg);
    });
  } catch (error) {
    console.error(error);
  }
};

const handleOrderUserQueue = async (
  channel: amqp.Channel,
  msg: amqp.Message
) => {
  try {
    const { username, event } = JSON.parse(msg.content);
    if (!username || !event) {
      channel.ack(msg);
      return;
    }
    const user = await User.findOne({ username });
    if (!user) {
      channel.ack(msg);
      return;
    }
    user.next_event = `${event.title} (${event.start_date})`;
    await user.save();
    channel.ack(msg);
  } catch (e) {
    console.error(e);
  }
};
