import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "warden"], default: "student", required: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    avatar: { type: String, default: "" },
    googleId: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Student = model("Student", studentSchema);

