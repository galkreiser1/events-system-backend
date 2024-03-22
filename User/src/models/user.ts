import * as mongoose from "mongoose";

export interface userType {
  username: string;
  password: string;
  permission: "U" | "W" | "M" | "A";
  coupons_used: number;
}

const userSchema = new mongoose.Schema<userType>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permission: {
      type: String,
      enum: ["U", "W", "M", "A"],
      required: true,
      default: "U",
    },

    coupons_used: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
