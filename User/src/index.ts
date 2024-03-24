import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import {
  loginRoute,
  logoutRoute,
  signupRoute,
  updateNextEventRoute,
  updateNumofCouponsRoute,
  getNextEventRoute,
  getNumofCouponsRoute,
  //usernameRoute,
} from "./routes.js";

import {
  getEventRoute,
  getAllEventsRoute,
  createEventRoute,
  updateEventDateRoute,
  updateTicketRoute,
} from "./event_routes.js";

import {
  createOrderRoute,
  getUsersByEventRoute,
  getUserOrdersRoute,
} from "./order_routes.js";

import {
  LOGIN_PATH,
  LOGOUT_PATH,
  NEXT_EVENT_PATH,
  SIGNUP_PATH,
  COUPONS_PATH,
  USERNAME_PATH,
  GET_EVENT_PATH,
  GET_ALL_EVENTS_PATH,
  CREATE_EVENT_PATH,
  UPDATE_EVENT_DATE_PATH,
  UPDATE_EVENT_TICKET_PATH,
  CREATE_ORDER_PATH,
  GET_USERS_BY_EVENT_PATH,
  GET_USER_ORDERS_PATH,
} from "./consts.js";

dotenv.config();

let dbUri;
const dbusername = process.env.DBUSERNAME || "galkreiser";
const dbpass = process.env.DBPASS || "bADRRlIAm7ke6K5N";

dbUri = `mongodb+srv://${dbusername}:${dbpass}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ========== */

/* USER ROUTES */
app.post(LOGIN_PATH, loginRoute);
app.post(LOGOUT_PATH, logoutRoute);
app.post(SIGNUP_PATH, signupRoute);
app.post(NEXT_EVENT_PATH, updateNextEventRoute);
app.post(COUPONS_PATH, updateNumofCouponsRoute);

app.get(NEXT_EVENT_PATH, getNextEventRoute);
app.get(COUPONS_PATH, getNumofCouponsRoute);

//app.get(USERNAME_PATH, usernameRoute);

/* EVENT ROUTES */
app.get(GET_EVENT_PATH, getEventRoute);
app.get(GET_ALL_EVENTS_PATH, getAllEventsRoute);
app.post(CREATE_EVENT_PATH, createEventRoute);
app.put(UPDATE_EVENT_DATE_PATH, updateEventDateRoute);
app.put(UPDATE_EVENT_TICKET_PATH, updateTicketRoute);

/*ORDER ROUTES*/
app.post(CREATE_ORDER_PATH, createOrderRoute);
app.get(GET_USERS_BY_EVENT_PATH, getUsersByEventRoute);
app.get(GET_USER_ORDERS_PATH, getUserOrdersRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
