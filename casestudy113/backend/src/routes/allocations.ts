import { Router, Response } from "express";
import mongoose from "mongoose";
import { Allocation } from "../models/Allocation";
import { Room } from "../models/Room";
import { authenticate, requireStudent, requireWarden, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.occupiedCount >= room.capacity) {
      return res.status(400).json({ message: "Room is full" });
    }

    const existing = await Allocation.findOne({
      student: req.user!.id,
      status: { $in: ["pending", "approved"] }
    });

    if (existing) {
      return res.status(400).json({ message: "You already have an active allocation request" });
    }

    const allocation = await Allocation.create({
      student: req.user!.id,
      room: roomId,
      status: "pending"
    });

    return res.status(201).json(allocation);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create allocation request" });
  }
});

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.user!.role === "warden" ? {} : { student: req.user!.id };
    const allocations = await Allocation.find(query)
      .populate("student", "name email")
      .populate("room", "roomNumber capacity occupiedCount")
      .sort({ createdAt: -1 });

    return res.json(allocations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch allocations" });
  }
});

router.patch("/:id/status", authenticate, requireWarden, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid allocation ID" });
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const allocation = await Allocation.findById(id);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    if (allocation.status !== "pending") {
      return res.status(400).json({ message: "Only pending allocations can be processed" });
    }

    if (status === "approved") {
      const room = await Room.findById(allocation.room);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (room.occupiedCount >= room.capacity) {
        return res.status(400).json({ message: "Room is full" });
      }

      allocation.status = "approved";
      room.occupiedCount += 1;
      await room.save();
      await allocation.save();

      return res.json({ message: "Allocation approved successfully", allocation });
    }

    allocation.status = "rejected";
    await allocation.save();

    return res.json({ message: "Allocation rejected", allocation });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update allocation status" });
  }
});

export default router;
