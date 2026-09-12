import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Meeting from "../models/Meeting";
import Message from "../models/Message";
import SharedFile from "../models/SharedFile";
import { AuthRequest } from "../middleware/auth";

export const createMeeting = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  const meetingId = uuidv4().slice(0, 8);
  const meeting = await Meeting.create({
    title: title || "Untitled Meeting",
    meetingId,
    host: req.userId,
    participants: [req.userId],
    status: "active",
  });
  res.status(201).json(meeting);
};

export const getMeeting = async (req: AuthRequest, res: Response) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.id })
    .populate("host", "name email avatar")
    .populate("participants", "name email avatar");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  if (meeting.status === "ended") {
    return res.status(410).json({ message: "Meeting has ended" });
  }
  res.json(meeting);
};

export const getRecentMeetings = async (req: AuthRequest, res: Response) => {
  const meetings = await Meeting.find({
    $or: [{ host: req.userId }, { participants: req.userId }],
  })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(meetings);
};

export const endMeeting = async (req: AuthRequest, res: Response) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.id });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  if (meeting.host.toString() !== req.userId) {
    return res.status(403).json({ message: "Only the host can end the meeting" });
  }
  meeting.status = "ended";
  meeting.endedAt = new Date();
  await meeting.save();
  res.json({ message: "Meeting ended" });
};

export const getMeetingMessages = async (req: AuthRequest, res: Response) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.id });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  const isParticipant =
    meeting.host.toString() === req.userId ||
    meeting.participants.some((p) => p.toString() === req.userId);
  if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

  const messages = await Message.find({ meeting: meeting._id })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });
  res.json(messages);
};

export const getMeetingFiles = async (req: AuthRequest, res: Response) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.id });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  const isParticipant =
    meeting.host.toString() === req.userId ||
    meeting.participants.some((p) => p.toString() === req.userId);
  if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

  const files = await SharedFile.find({ meeting: meeting._id }).populate(
    "uploader",
    "name avatar"
  );
  res.json(files);
};

export const uploadMeetingFile = async (req: AuthRequest, res: Response) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.id });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  const isParticipant =
    meeting.host.toString() === req.userId ||
    meeting.participants.some((p) => p.toString() === req.userId);
  if (!isParticipant) return res.status(403).json({ message: "Not authorized" });
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const sharedFile = await SharedFile.create({
    meeting: meeting._id,
    uploader: req.userId,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });
  const populated = await sharedFile.populate("uploader", "name avatar");
  res.status(201).json(populated);
};
