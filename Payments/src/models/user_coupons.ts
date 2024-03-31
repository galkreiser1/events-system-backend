import * as mongoose from "mongoose";

interface userCouponsType {
  code: string;
  username: string;
}

const userCouponsSchema = new mongoose.Schema<userCouponsType>({
  code: { type: String, required: true },
  username: { type: String, required: true },
});

userCouponsSchema.index({ code: 1, username: 1 }, { unique: true });

export default mongoose.model<userCouponsType>("UserCoupon", userCouponsSchema);
