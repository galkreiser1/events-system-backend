import Event from "./models/event.js";
export async function getEventRoute(req, res) {
    const eventId = req.params.id;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            res.status(404).json({ message: "Event not found" });
        }
        else {
            res.status(200).json(event);
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
}
export const getAllEventsRoute = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    }
    catch (error) {
        console.error("Error retrieving events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const createEventRoute = async (req, res) => {
    try {
        const eventData = req.body;
        console.log("eventData", eventData);
        const newEvent = new Event(eventData);
        await newEvent.save();
        res.status(201).json(newEvent);
    }
    catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const updateEventDatesRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.body;
        const updateFields = {};
        if (start_date !== undefined) {
            updateFields.start_date = start_date;
        }
        if (end_date !== undefined) {
            updateFields.end_date = end_date;
        }
        const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        return res.json({ event: updatedEvent });
    }
    catch (error) {
        console.error("Error updating event dates:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const updateTicketQuantityRoute = async (req, res) => {
    const eventId = req.params.id;
    const { ticketType, quantity } = req.body;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const ticketIndex = event.tickets.findIndex((ticket) => ticket.type === ticketType);
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
        res.json(event);
    }
    catch (error) {
        console.error("Error updating ticket quantity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
//# sourceMappingURL=routes.js.map