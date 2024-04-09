import * as amqp from "amqplib";
import User from "./models/user.js";

export const consumeMessages = async () => {
  try {
    // connect to RabbitMQ
    const conn = await amqp.connect(
      "amqps://eayfadwk:dQJ0QpNDB2ihFMPsiPkfEMYba5TL2Oya@sparrow.rmq.cloudamqp.com/eayfadwk"
    );
    const orderChannel = await conn.createChannel();
    const paymentChannel = await conn.createChannel();

    // Declare an exchange with a name 'order_exchange' and type 'fanout'.
    // 'fanout' type broadcasts all the messages it receives to all the queues it knows.
    // `{ durable: false }` means the exchange will not survive a broker restart.
    const orderExchange = "order_user_exchange";
    await orderChannel.assertExchange(orderExchange, "fanout", {
      durable: false,
    });
    const paymentExchange = "payment_user_exchange";
    await paymentChannel.assertExchange(paymentExchange, "fanout", {
      durable: false,
    });

    // Declare a queue with a name 'order_queue'. If it doesn't exist, it will be created.
    // `{ durable: false }` here means messages in the queue are stored in memory only, not on disk.
    const orderQueue = "order_user_queue";
    await orderChannel.assertQueue(orderQueue, { durable: false });
    const paymentQueue = "payment_user_queue";
    await paymentChannel.assertQueue(paymentQueue, { durable: false });

    // Bind the declared queue to the exchange. This creates a relationship between the exchange and the queue.
    // Messages sent to this exchange will be routed to the queue according to the exchange type and routing rules.
    // The empty string as the third parameter is the routing key, which is ignored by fanout exchanges.
    await orderChannel.bindQueue(orderQueue, orderExchange, "");
    await paymentChannel.bindQueue(paymentQueue, paymentExchange, "");

    // Start consuming messages from the queue. The callback function is invoked whenever a message is received.
    // `msg.content.toString()` converts the message content to a string for logging or processing.
    // `channel.ack(msg)` acknowledges the message, indicating it has been processed and can be removed from the queue.
    await orderChannel.consume(orderQueue, (msg) => {
      console.log(
        `Comsumer >>> received message: ${JSON.parse(msg.content).username}`
      );
      handleOrderUserQueue(orderChannel, msg);
    });

    await paymentChannel.consume(paymentQueue, (msg) => {
      console.log(
        `Comsumer >>> received message: ${JSON.parse(msg.content).username}`
      );
      handlePaymentUserQueue(paymentChannel, msg);
    });
  } catch (error) {
    console.log(error.message);
  }
};

const handlePaymentUserQueue = async (
  channel: amqp.Channel,
  msg: amqp.Message
) => {
  const username = JSON.parse(msg.content).username;
  let user;
  try {
    user = await User.findOne({ username });
    user.coupons_used += 1;
    await user.save();
    channel.ack(msg);
  } catch (e) {
    console.log(e.message);
  }
};

const handleOrderUserQueue = async (
  channel: amqp.Channel,
  msg: amqp.Message
) => {
  try {
    const { username, event } = JSON.parse(msg.content);
    if (!username) {
      channel.ack(msg);
      return;
    }
    const user = await User.findOne({ username });
    if (!user) {
      channel.ack(msg);
      return;
    }

    user.next_event = "";

    if (event) {
      const date_start_date = new Date(event.start_date);
      user.next_event = `${event.title} (${date_start_date.toLocaleDateString(
        "en-GB"
      )})`;
    }
    await user.save();
    channel.ack(msg);
  } catch (e) {
    console.log(e.message);
  }
};
