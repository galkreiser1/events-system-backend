import { Request, Response } from "express";
import Event from "./models/event.js";
import TicketLock from "./models/ticketlock.js";
import { publisherChannel } from "./index.js";

export async function getEventRoute(req: Request, res: Response) {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({ message: "Event not found" });
    } else {
      res.status(200).json(event);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

export const getAllEventsRoute = async (req: Request, res: Response) => {
  try {
    let { page } = req.query;

    if (page) {
      page = !isNaN(parseInt(page as string, 10))
        ? parseInt(page as string, 10)
        : 1;
    } else {
      page = 1;
    }

    const eventsPerPage = 9;
    const skip = (page - 1) * eventsPerPage;

    // Fetch events for the current page
    const events = await Event.find({}).skip(skip).limit(eventsPerPage);

    res.json(events);
  } catch (error) {
    console.log("Error retrieving events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createEventRoute = async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    const startDate = new Date(eventData.start_date);
    const endDate = new Date(eventData.end_date);

    if (startDate.getTimezoneOffset() === 0) {
      startDate.setUTCHours(startDate.getUTCHours() + 2);
    }
    if (endDate.getTimezoneOffset() === 0) {
      endDate.setUTCHours(endDate.getUTCHours() + 2);
    }

    eventData.start_date = startDate;
    eventData.end_date = endDate;
    const newEvent = new Event(eventData);

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.log("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEventDatesRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { start_date, end_date } = req.body;

    const updateFields: any = {};

    if (start_date !== undefined) {
      updateFields.start_date = new Date(start_date);
      // if (updateFields.start_date.getTimezoneOffset() === 0) {
      //   updateFields.start_date.setUTCHours(
      //     updateFields.start_date.getUTCHours() + 2
      //   );
      // }
    }
    if (end_date !== undefined) {
      updateFields.end_date = new Date(end_date);
      // if (updateFields.end_date.getTimezoneOffset() === 0) {
      //   updateFields.end_date.setUTCHours(
      //     updateFields.end_date.getUTCHours() + 2
      //   );
      // }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    await publisherChannel.sendEvent(JSON.stringify({ event_id: id }));

    return res.status(200).json({ event: updatedEvent });
  } catch (error) {
    console.log("Error updating event dates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTicketQuantityRoute = async (
  req: Request,
  res: Response
) => {
  const eventId = req.params.id;
  const { ticket_type, quantity } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const ticketIndex = event.tickets.findIndex(
      (ticket) => ticket.type === ticket_type
    );

    if (ticketIndex === -1) {
      return res
        .status(404)
        .json({ error: "Ticket type not found for the event" });
    }

    console.log("subtract quantity: ", quantity);
    console.log("current quantity: ", event.tickets[ticketIndex].quantity);
    const updatedQuantity = event.tickets[ticketIndex].quantity - quantity;
    console.log("updated quantity: ", updatedQuantity);

    if (updatedQuantity < 0) {
      return res
        .status(400)
        .json({ error: "Ticket quantity cannot go below 0" });
    }

    event.tickets[ticketIndex].quantity = updatedQuantity;

    await event.save();

    res.json(event);
  } catch (error) {
    console.log("Error updating ticket quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const lockTicketRoute = async (req: Request, res: Response) => {
  console.log("locking");
  const { username, event_id, type, quantity } = req.body;

  try {
    const event = await Event.findById(event_id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const ticketIndex = event.tickets.findIndex(
      (ticket) => ticket.type === type
    );

    if (ticketIndex === -1) {
      console.log("Ticket type not found");
      return res.status(404).json({ error: "Ticket type not found" });
    }

    const ticket = event.tickets[ticketIndex];

    let lockedTicketsQuantity = await TicketLock.aggregate([
      {
        $match: {
          event_id,
          type,
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);

    const lockedQuantity = lockedTicketsQuantity[0]?.total || 0;
    const unlockedQuantity = ticket.quantity - lockedQuantity;

    if (unlockedQuantity < quantity) {
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    const newLock = new TicketLock({
      username,
      event_id,
      type,
      quantity,
    });

    await newLock.save();

    console.log("lock created");
    res.status(201).json({ lock_id: newLock._id });
  } catch (error) {
    console.log("Error locking ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const unLockTicketRoute = async (req: Request, res: Response) => {
  const { lock_id, event_id, type, quantity } = req.body;

  console.log("unlocking lock_id", lock_id);

  try {
    await TicketLock.findByIdAndDelete(lock_id);

    const event = await Event.findById(event_id);
    const ticketIndex = event.tickets.findIndex(
      (ticket) => ticket.type === type
    );
    if (ticketIndex === -1) {
      return res
        .status(404)
        .json({ error: "Ticket type not found for the event" });
    }
    const updatedQuantity = event.tickets[ticketIndex].quantity - quantity;
    if (updatedQuantity < 0) {
      return res
        .status(400)
        .json({ error: "Ticket quantity cannot go below 0" });
    }
    event.tickets[ticketIndex].quantity = updatedQuantity;
    await event.save();

    res.status(200).json({ message: "Lock removed" });
  } catch (error) {
    console.log("Error unlocking ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
