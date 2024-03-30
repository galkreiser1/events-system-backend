import * as mongoose from "mongoose";

interface commentType {
  event_id: string;
  username: string;
  text: string;
  date: string;
}

const commentSchema = new mongoose.Schema<commentType>({
  event_id: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.model<commentType>("Comment", commentSchema);
