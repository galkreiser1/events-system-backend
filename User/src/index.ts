import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

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
  LOGIN_PATH,
  LOGOUT_PATH,
  NEXT_EVENT_PATH,
  SIGNUP_PATH,
  COUPONS_PATH,
  USERNAME_PATH,
} from "./consts.js";

dotenv.config();

let dbUri;
dbUri = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

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

app.post(LOGIN_PATH, loginRoute);
app.post(LOGOUT_PATH, logoutRoute);
app.post(SIGNUP_PATH, signupRoute);
app.post(NEXT_EVENT_PATH, updateNextEventRoute);
app.post(COUPONS_PATH, updateNumofCouponsRoute);

app.get(NEXT_EVENT_PATH, getNextEventRoute);
app.get(COUPONS_PATH, getNumofCouponsRoute);

//app.get(USERNAME_PATH, usernameRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
