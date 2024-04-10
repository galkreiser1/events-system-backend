import * as amqp from "amqplib";
import { config } from "./config.js";

const AMQPUSER = process.env.AMQPUSER || config.AMQPUSER;
const AMQPPASS = process.env.AMQPPASS || config.AMQPPASS;

export class PublisherChannel {
  channel: amqp.Channel;
  exchange: string;

  constructor(exchange: string) {
    this.exchange = exchange;
  }

  // Method to create a channel on the RabbitMQ connection
  async createChannel() {
    const connection = await amqp.connect(
      `amqps://${AMQPUSER}:${AMQPPASS}@sparrow.rmq.cloudamqp.com/eayfadwk`
    );
    // Create a channel on this connection
    this.channel = await connection.createChannel();
  }

  // Method to send an event/message to a specified exchange
  async sendEvent(msg: string) {
    if (!this.channel) {
      await this.createChannel();
    }

    // Use the exchange specified in the constructor
    const exchange = this.exchange;

    // Declare the exchange if it doesn't exist
    await this.channel.assertExchange(exchange, "fanout", { durable: false });

    // Publish the message to the exchange
    await this.channel.publish(exchange, "", Buffer.from(msg));
    console.log(
      `Publisher >>> | message "${msg}" published to exchange "${exchange}"`
    );
  }
}
