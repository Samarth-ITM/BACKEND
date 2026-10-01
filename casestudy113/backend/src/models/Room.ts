import { Schema, model } from "mongoose";

const roomSchema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  occupiedCount: { type: Number, default: 0 }
});

export const Room = model("Room", roomSchema);
