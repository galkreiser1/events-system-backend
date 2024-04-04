import express from "express";
import dotenv from "dotenv";
import {
  CREATE_COMMENT,
  GET_COMMENTS_BY_EVENT,
  GET_NUM_OF_COMMENTS_BY_EVENT,
} from "./const.js";
import mongoose from "mongoose";
import {
  createCommentRoute,
  getCommentsByEventRoute,
  getNumOfCommentsByEventRoute,
} from "./routes.js";
import cors from "cors";

dotenv.config();

let dbUri;

dbUri = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.post(CREATE_COMMENT, createCommentRoute);
app.get(GET_NUM_OF_COMMENTS_BY_EVENT, getNumOfCommentsByEventRoute);
app.get(GET_COMMENTS_BY_EVENT, getCommentsByEventRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
