import express from "express";
import dotenv from "dotenv";
import {
  GET_EVENT,
  GET_ALL_EVENTS,
  CREATE_EVENT,
  UPDATE_EVENT_DATE,
  UPDATE_EVENT_TICKET,
  LOCK_TICKET,
  UNLOCK_TICKET,
} from "./const.js";
import mongoose from "mongoose";
import {
  getEventRoute,
  getAllEventsRoute,
  createEventRoute,
  updateEventDatesRoute,
  updateTicketQuantityRoute,
  lockTicketRoute,
  unLockTicketRoute,
} from "./routes.js";

import { PublisherChannel } from "./publisher.js";
import { config } from "./config.js";

dotenv.config();

export const publisherChannel = new PublisherChannel();

let dbUri;

const DBUSER = process.env.DBUSER || config.DBUSER;
const DBPASS = process.env.DBPASS || config.DBPASS;

const API_KEY = process.env.API_KEY || config.AUTH_KEY;

dbUri = `mongodb+srv://${DBUSER}:${DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3001;

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

app.get(GET_EVENT, getEventRoute);
app.get(GET_ALL_EVENTS, getAllEventsRoute);
app.post(CREATE_EVENT, createEventRoute);
app.put(UPDATE_EVENT_DATE, updateEventDatesRoute);
app.put(UPDATE_EVENT_TICKET, updateTicketQuantityRoute);
app.post(LOCK_TICKET, lockTicketRoute);
app.post(UNLOCK_TICKET, unLockTicketRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
