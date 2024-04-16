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
  wakeUpCommentRoute,
} from "./routes.js";
import cors from "cors";

dotenv.config();

let dbUri;

dbUri = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASS}@cluster2.zpgwucf.mongodb.net/events_system?retryWrites=true&w=majority&appName=Cluster2`;

await mongoose.connect(dbUri);

const port = process.env.PORT || 3005;

const API_KEY = process.env.API_KEY;

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

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.post(CREATE_COMMENT, createCommentRoute);
app.get(GET_NUM_OF_COMMENTS_BY_EVENT, getNumOfCommentsByEventRoute);
app.get(GET_COMMENTS_BY_EVENT, getCommentsByEventRoute);
app.get("/wakeup", wakeUpCommentRoute);

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
