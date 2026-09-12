import { Response } from "express";
import path from "path";
import SharedFile from "../models/SharedFile";
import Meeting from "../models/Meeting";
import { AuthRequest } from "../middleware/auth";

export const downloadFile = async (req: AuthRequest, res: Response) => {
  const file = await SharedFile.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: "File not found" });

  const meeting = await Meeting.findById(file.meeting);
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const isParticipant =
    meeting.host.toString() === req.userId ||
    meeting.participants.some((p) => p.toString() === req.userId);
  if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

  res.download(path.resolve(file.path), file.originalName);
};
