import express from "express";
import dotenv from "dotenv";
import { consumeMessages } from "./consumer.js";
import { config } from "./config.js";

import {
  CREATE_ORDER,
  GET_USER_ORDERS,
  GET_USERS_BY_EVENT,
  GET_EVENTS_BY_USER,
  GET_USER_NEXT_EVENT,
} from "./const.js";
import mongoose from "mongoose";
import {
  createOrderRoute,
  getUserOrdersRoute,
  getUsersByEventRoute,
  getEventsByUserRoute,
  getUserNextEventRoute,
} from "./routes.js";

import { PublisherChannel } from "./publisher.js";

export const publisherChannel = new PublisherChannel();

dotenv.config();

let dbUri;

const DBUSER = process.env.DBUSER || config.DBUSER;
const DBPASS = process.env.DBPASS || config.DBPASS;
const API_KEY = process.env.API_KEY || config.API_KEY;

dbUri = `mongodb+srv://${DBUSER}:${DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);
consumeMessages();

const port = process.env.PORT || 3002;

const app = express();
app.use(express.json());

const apiKeyMiddleware = (req, res, next) => {
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

app.post(CREATE_ORDER, createOrderRoute);
app.get(GET_USER_ORDERS, getUserOrdersRoute);
app.get(GET_USERS_BY_EVENT, getUsersByEventRoute);
app.get(GET_EVENTS_BY_USER, getEventsByUserRoute);
app.get(GET_USER_NEXT_EVENT, getUserNextEventRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
