import * as mongoose from "mongoose";

interface commentType {
  event_id: string;
  username: string;
  comment: string;
  date: Date;
}

const commentSchema = new mongoose.Schema<commentType>({
  event_id: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  date: { type: Date, required: true },
});

export default mongoose.model<commentType>("Order", commentSchema);
