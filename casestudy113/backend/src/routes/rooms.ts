import { Router, Response } from "express";
import { Room } from "../models/Room";
import { authenticate, requireWarden, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

router.post("/", authenticate, requireWarden, async (req: AuthRequest, res: Response) => {
  try {
    const { roomNumber, capacity } = req.body;

    if (!roomNumber || capacity === undefined) {
      return res.status(400).json({ message: "Room number and capacity are required" });
    }

    if (capacity <= 0) {
      return res.status(400).json({ message: "Capacity must be greater than 0" });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    const room = await Room.create({
      roomNumber,
      capacity,
      occupiedCount: 0
    });

    return res.status(201).json(room);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create room" });
  }
});

router.patch("/:id", authenticate, requireWarden, async (req: AuthRequest, res: Response) => {
  try {
    const { roomNumber, capacity } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (capacity !== undefined) {
      if (capacity < room.occupiedCount) {
        return res.status(400).json({ message: "Capacity cannot be less than occupied count" });
      }
      room.capacity = capacity;
    }

    if (roomNumber && roomNumber !== room.roomNumber) {
      const duplicate = await Room.findOne({ roomNumber });
      if (duplicate) {
        return res.status(400).json({ message: "Room number already exists" });
      }
      room.roomNumber = roomNumber;
    }

    await room.save();
    return res.json(room);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update room" });
  }
});

router.delete("/:id", authenticate, requireWarden, async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.occupiedCount > 0) {
      return res.status(400).json({ message: "Cannot delete room with occupied beds" });
    }

    await Room.findByIdAndDelete(req.params.id);
    return res.json({ message: "Room deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete room" });
  }
});

export default router;
