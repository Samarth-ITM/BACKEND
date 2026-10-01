import { Schema, model } from "mongoose";

const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "warden"], default: "student", required: true }
});

export const Student = model("Student", studentSchema);
