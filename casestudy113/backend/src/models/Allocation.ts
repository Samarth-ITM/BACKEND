import { Schema, model } from "mongoose";

const allocationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export const Allocation = model("Allocation", allocationSchema);
