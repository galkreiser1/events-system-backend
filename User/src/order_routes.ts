import { Request, Response } from "express";
import axios from "axios";
import { verifyToken, getUsernameFromCookie } from "./helper_func.js";
import { ORDERS_SERVER_URL, IS_LOCAL } from "./consts.js";
import { config } from "./config.js";

const ORDERS_SERVICE_URL = IS_LOCAL
  ? "http://localhost:3002"
  : ORDERS_SERVER_URL;

export const createOrderRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const orderData = req.body;

    const response = await axios.post(
      `${ORDERS_SERVICE_URL}/api/order`,
      orderData,
      config.API_KEY_HEADER
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersByEventRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const eventId = req.params.eventId;

    const response = await axios.get(
      `${ORDERS_SERVICE_URL}/api/order/users/${eventId}`,
      config.API_KEY_HEADER
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching users by event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserOrdersRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const username = getUsernameFromCookie(req);

    const response = await axios.get(
      `${ORDERS_SERVICE_URL}/api/order/${username}`,
      config.API_KEY_HEADER
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventsByUserRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const username = req.params.username;

    const response = await axios.get(
      `${ORDERS_SERVICE_URL}/api/order/events/${username}`,
      config.API_KEY_HEADER
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching events by user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
