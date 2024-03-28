import express from "express";
import dotenv from "dotenv";
import { consumeMessages } from "./consumer.js";

import {
  CREATE_ORDER,
  GET_USER_ORDERS,
  GET_USERS_BY_EVENT,
  GET_EVENTS_BY_USER,
} from "./const.js";
import mongoose from "mongoose";
import {
  createOrderRoute,
  getUserOrdersRoute,
  getUsersByEventRoute,
  getEventsByUserRoute,
} from "./routes.js";

import { PublisherChannel } from "./publisher.js";

export const publisherChannel = new PublisherChannel();

dotenv.config();

let dbUri;

const DBUSER = process.env.DBUSER || "galkreiser";
const DBPASS = process.env.DBPASS || "bADRRlIAm7ke6K5N";

dbUri = `mongodb+srv://${DBUSER}:${DBPASS}@cluster2.zpgwucf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);
consumeMessages();

const port = process.env.PORT || 3002;

const app = express();
app.use(express.json());

app.post(CREATE_ORDER, createOrderRoute);
app.get(GET_USER_ORDERS, getUserOrdersRoute);
app.get(GET_USERS_BY_EVENT, getUsersByEventRoute);
app.get(GET_EVENTS_BY_USER, getEventsByUserRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
