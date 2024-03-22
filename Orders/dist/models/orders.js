import * as mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    checkout_date: { type: Date, required: true },
    ticket_type: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    event_id: { type: String, required: true },
    user_id: { type: String, required: true },
});
//# sourceMappingURL=orders.js.map