import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { CREATE_COUPON, GET_COUPON, BUY } from "./const.js";
import { createCouponRoute, getCouponRoute, buyRoute } from "./routes.js";
import { PublisherChannel } from "./publisher.js";
import { consumeMessages } from "./consumer.js";

dotenv.config();

export const orderPublisher = new PublisherChannel("payment_order_exchange");
export const paymentPublisher = new PublisherChannel(
  "payment_payment_exchange"
);
export const userPublisher = new PublisherChannel("payment_user_exchange");

let dbUri;

const DBUSER = process.env.DBUSER || "galkreiser";
const DBPASS = process.env.DBPASS || "bADRRlIAm7ke6K5N";

dbUri = `mongodb+srv://${DBUSER}:${DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3003;

consumeMessages();

const app = express();
app.use(express.json());

app.post(CREATE_COUPON, createCouponRoute);
app.get(GET_COUPON, getCouponRoute);
app.post(BUY, buyRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
