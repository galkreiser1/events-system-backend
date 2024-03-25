import { Request, Response } from "express";
import axios from "axios";
import { verifyToken } from "./helper_func.js";

const EVENTS_SERVICE_URL = "http://localhost:3001";

export const getEventRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const eventId = req.params.id;
    const response = await axios.get(
      `${EVENTS_SERVICE_URL}/api/event/${eventId}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllEventsRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const response = await axios.get(`${EVENTS_SERVICE_URL}/api/event`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createEventRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const eventData = req.body;
    console.log(eventData);

    const response = await axios.post(
      `${EVENTS_SERVICE_URL}/api/event`,
      eventData
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEventDateRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const eventId = req.params.id;

    const { start_date, end_date } = req.body;

    if (!start_date && !end_date) {
      res.status(200).send("Empty Update");
      return;
    }

    const eventData = {};
    if (start_date) {
      eventData["start_date"] = start_date;
    }
    if (end_date) {
      eventData["end_date"] = end_date;
    }

    const response = await axios.put(
      `${EVENTS_SERVICE_URL}/api/event/${eventId}/date`,
      eventData
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error updating event dates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTicketRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res) && !req.headers["admin"]) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const eventId = req.params.id;

    const { ticket_type, quantity } = req.body;

    if (!ticket_type || !quantity) {
      res.status(400).send("Both ticket_type and quantity must be provided");
      return;
    }

    const response = await axios.put(
      `${EVENTS_SERVICE_URL}/api/event/${eventId}/ticket`,
      {
        ticket_type,
        quantity,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error updating ticket quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
