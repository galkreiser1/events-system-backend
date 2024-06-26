import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { CREATE_COUPON, GET_COUPON, BUY } from "./const.js";
import {
  createCouponRoute,
  getCouponRoute,
  buyRoute,
  wakeUpPaymentRoute,
} from "./routes.js";
import { PublisherChannel } from "./publisher.js";
import { consumeMessages } from "./consumer.js";
import { config } from "./config.js";

dotenv.config();

export const orderPublisher = new PublisherChannel("payment_order_exchange");
export const paymentPublisher = new PublisherChannel(
  "payment_payment_exchange"
);
export const userPublisher = new PublisherChannel("payment_user_exchange");

let dbUri;

const DBUSER = process.env.DBUSER || config.DBUSER;
const DBPASS = process.env.DBPASS || config.DBPASS;
const API_KEY = process.env.API_KEY || config.API_KEY;

dbUri = `mongodb+srv://${DBUSER}:${DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3003;

consumeMessages();

const app = express();
app.use(express.json());

const apiKeyMiddleware = (req, res, next) => {
  const { path } = req;
  console.log(path);

  if (path === "/wakeup") {
    // Allow requests with path "/wakeup" to proceed without authorization check
    console.log(path);
    next();
    return;
  }
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (token === API_KEY) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.use(apiKeyMiddleware);

app.post(CREATE_COUPON, createCouponRoute);
app.get(GET_COUPON, getCouponRoute);
app.post(BUY, buyRoute);
app.get("/wakeup", wakeUpPaymentRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
