import { Request, Response } from "express";
import Order from "./models/order.js";
import axios from "axios";

export const getUserOrdersRoute = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.find({ user_id: userId }).exec();

    const ordersWithEvents = await Promise.all(
      orders.map(async (order) => {
        const eventResponse = await axios.get(`/api/event/${order.event_id}`);
        const event = eventResponse.data;

        const orderWithEvent = { ...order, event };
        delete orderWithEvent.event_id;
        return orderWithEvent;
      })
    );

    res.json(ordersWithEvents);
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

    const userIds = orders.map((order) => order.user_id);

    const uniqueUserIds = Array.from(new Set(userIds));

    res.status(200).json(uniqueUserIds);
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
