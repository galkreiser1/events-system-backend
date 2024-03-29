import { Request, Response } from "express";
import Order from "./models/order.js";
import axios from "axios";
import { IS_LOCAL } from "./const.js";

const EVENTS_SERVICE_URL = IS_LOCAL
  ? "http://localhost:3001"
  : "https://events-system-event.onrender.com";

export const getUserOrdersRoute = async (req: Request, res: Response) => {
  const username = req.params.username;

  try {
    const orders = await Order.find({ username: username }).lean();

    const ordersWithEvents = await Promise.all(
      orders.map(async (order) => {
        const eventResponse = await axios.get(
          `${EVENTS_SERVICE_URL}/api/event/${order.event_id}`
        );
        const event = eventResponse.data;
        delete event._id;
        const { checkout_date, ticket_type, quantity, username } = order;
        const trimOrder = { checkout_date, ticket_type, quantity, username };
        const orderWithEvent = { ...trimOrder, event };
        return orderWithEvent;
      })
    );

    res.status(200).json(ordersWithEvents);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createOrderRoute = async (req: Request, res: Response) => {
  const { checkout_date, ticket_type, quantity, event_id, user_id } = req.body;

  try {
    const newOrder = new Order({
      checkout_date,
      ticket_type,
      quantity,
      event_id,
      user_id,
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsersByEventRoute = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;

  try {
    const orders = await Order.find({ event_id: eventId });

    const username = orders.map((order) => order.username);

    const uniqueUsernames = Array.from(new Set(username));

    res.status(200).json(uniqueUsernames);
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventsByUserRoute = async (req: Request, res: Response) => {
  const username = req.params.username;

  try {
    const orders = await Order.find({ username: username });

    const events = orders.map((order) => order.event_id);

    const uniqueEvents = Array.from(new Set(events));

    res.status(200).json(uniqueEvents);
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
