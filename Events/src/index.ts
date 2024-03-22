import express from "express";
import dotenv from "dotenv";
import {
  GET_EVENT,
  GET_ALL_EVENTS,
  CREATE_EVENT,
  UPDATE_EVENT_DATE,
  UPDATE_EVENT_TICKET,
} from "./const.js";
import mongoose from "mongoose";
import {
  getEventRoute,
  getAllEventsRoute,
  createEventRoute,
  updateEventDatesRoute,
  updateTicketQuantityRoute,
} from "./routes.js";

dotenv.config();

let dbUri;

dbUri = `mongodb+srv://galkreiser:bADRRlIAm7ke6K5N@cluster2.zpgwucf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get(GET_EVENT, getEventRoute);
app.get(GET_ALL_EVENTS, getAllEventsRoute);
app.post(CREATE_EVENT, createEventRoute);
app.put(UPDATE_EVENT_DATE, updateEventDatesRoute);
app.put(UPDATE_EVENT_TICKET, updateTicketQuantityRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
