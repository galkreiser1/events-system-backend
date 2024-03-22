import express from "express";
import dotenv from "dotenv";
import { CREATE_ORDER, GET_USER_ORDERS } from "./const.js";
import mongoose from "mongoose";
import { createOrderRoute, getUserOrdersRoute } from "./routes.js";
dotenv.config();
let dbUri;
dbUri = `mongodb+srv://galkreiser:bADRRlIAm7ke6K5N@cluster2.zpgwucf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;
await mongoose.connect(dbUri);
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.get(CREATE_ORDER, createOrderRoute);
app.get(GET_USER_ORDERS, getUserOrdersRoute);
app.listen(port, () => {
    console.log(`Server running! port ${port}`);
});
//# sourceMappingURL=index.js.map