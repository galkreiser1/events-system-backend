import * as mongoose from "mongoose";

export interface ticketLockType {
  username: string;
  event_id: string;
  type: string;
  quantity: number;
  expiresAt?: Date;
}
const ticketLockSchema = new mongoose.Schema<ticketLockType>({
  username: { type: String, required: true },
  event_id: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 2 * 60 * 1000,
    index: { expires: "2m" },
  },
});

export default mongoose.model("TicketLock", ticketLockSchema);
