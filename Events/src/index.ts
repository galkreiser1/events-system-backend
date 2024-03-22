import express from "express";
import dotenv from "dotenv";
import { GET_EVENT } from "./const.js";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
