import { Request, Response } from "express";
import axios from "axios";
import { verifyToken } from "./helper_func.js";
import { ORDERS_SERVER_URL } from "./consts.js";

const is_local = false;

const ORDERS_SERVICE_URL = is_local
  ? "http://localhost:3002"
  : ORDERS_SERVER_URL;

export const createOrderRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const orderData = req.body;

    const response = await axios.post(
      `${ORDERS_SERVICE_URL}/api/order`,
      orderData
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersByEventRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const eventId = req.params.eventId;

    const response = await axios.get(
      `${ORDERS_SERVICE_URL}/api/order/users/${eventId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching users by event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserOrdersRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const userId = req.params.userId;

    const response = await axios.get(
      `${ORDERS_SERVICE_URL}/api/order/${userId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
