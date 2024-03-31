import * as amqp from "amqplib";
import Order from "./models/order.js";
import axios from "axios";
import { publisherChannel } from "./index.js";
import { IS_LOCAL } from "./const.js";

const EVENTS_SERVICE_URL = IS_LOCAL
  ? "http://localhost:3001"
  : "https://events-system-event.onrender.com";

export const consumeMessages = async () => {
  try {
    // connect to RabbitMQ
    const conn = await amqp.connect(
      "amqps://eayfadwk:dQJ0QpNDB2ihFMPsiPkfEMYba5TL2Oya@sparrow.rmq.cloudamqp.com/eayfadwk"
    );
    const eventChannel = await conn.createChannel();
    const paymentChannel = await conn.createChannel();

    // Declare an exchange with a name 'order_exchange' and type 'fanout'.
    // 'fanout' type broadcasts all the messages it receives to all the queues it knows.
    // `{ durable: false }` means the exchange will not survive a broker restart.
    const eventExchange = "event_order_exchange";
    await eventChannel.assertExchange(eventExchange, "fanout", {
      durable: false,
    });

    const paymentExchange = "payment_order_exchange";
    await paymentChannel.assertExchange(paymentExchange, "fanout", {
      durable: false,
    });

    // Declare a queue with a name 'order_queue'. If it doesn't exist, it will be created.
    // `{ durable: false }` here means messages in the queue are stored in memory only, not on disk.
    const eventQueue = "event_order_queue";
    await eventChannel.assertQueue(eventQueue, { durable: false });
    const paymentQueue = "payment_order_queue";
    await paymentChannel.assertQueue(paymentQueue, { durable: false });

    // Bind the declared queue to the exchange. This creates a relationship between the exchange and the queue.
    // Messages sent to this exchange will be routed to the queue according to the exchange type and routing rules.
    // The empty string as the third parameter is the routing key, which is ignored by fanout exchanges.
    await eventChannel.bindQueue(eventQueue, eventExchange, "");
    await paymentChannel.bindQueue(paymentQueue, paymentExchange, "");

    // Start consuming messages from the queue. The callback function is invoked whenever a message is received.
    // `msg.content.toString()` converts the message content to a string for logging or processing.
    // `eventChannel.ack(msg)` acknowledges the message, indicating it has been processed and can be removed from the queue.
    await eventChannel.consume(eventQueue, (msg) => {
      console.log(
        `Event comsumer >>> received message: ${
          JSON.parse(msg.content).event_id
        }`
      );
      const event_id = JSON.parse(msg.content).event_id;
      handleEventOrderQueue(event_id, eventChannel, msg);
    });

    await paymentChannel.consume(paymentQueue, (msg) => {
      console.log(
        `Payment comsumer >>> received message: ${
          JSON.parse(msg.content).order_id
        }`
      );
      const order_id = JSON.parse(msg.content).order_id;
      handlePaymentOrderQueue(paymentChannel, msg);
    });
  } catch (error) {
    console.error(error);
  }
};

const handlePaymentOrderQueue = async (
  channel: amqp.Channel,
  msg: amqp.Message
) => {
  const { order_id, checkout_date, ticket_type, quantity, event_id, username } =
    JSON.parse(msg.content);

  try {
    const newOrder = new Order({
      _id: order_id,
      checkout_date,
      ticket_type,
      quantity,
      event_id,
      username,
    });

    await newOrder.save();

    channel.ack(msg);
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

const updateUsersNextEvent = async (userEventsDict: any) => {
  for (const username in userEventsDict) {
    const eventIds = userEventsDict[username];

    const userEvents = await Promise.all(
      eventIds.map(async (eventId) => {
        const event = await axios.get(
          `${EVENTS_SERVICE_URL}/api/event/${eventId}`
        );
        return event.data;
      })
    );

    const earliestEvent = userEvents.reduce((earliest, current) => {
      if (new Date(current.start_date) >= new Date()) {
        if (
          !earliest ||
          new Date(current.start_date) < new Date(earliest.start_date)
        ) {
          return current;
        }
        return earliest;
      }
    }, null);

    const publisherMsg = {
      username: username,
      event: earliestEvent,
    };

    publisherChannel.sendEvent(JSON.stringify(publisherMsg));
  }
};

const handleEventOrderQueue = async (
  event_id: string,
  channel: amqp.Channel,
  msg: amqp.Message
) => {
  let results = [];
  try {
    results = await Order.find({ event_id });
    let users = results.map((result) => result.username);
    let userEventsDict = {};
    for (const username of users) {
      let users = await Order.find({ username });
      const userEvents = [...new Set(users.map((event) => event.event_id))];
      userEventsDict[username] = userEvents;
    }

    await updateUsersNextEvent(userEventsDict);
    channel.ack(msg);
  } catch (e) {
    console.error("Error fetching users by event:", e);
  }
};
