import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import Message from "../models/Message";
import Meeting from "../models/Meeting";

interface ParticipantInfo {
  socketId: string;
  userId: string;
  name: string;
  micOn: boolean;
  camOn: boolean;
  isHost: boolean;
}

// meetingId -> Map<socketId, ParticipantInfo>
const rooms = new Map<string, Map<string, ParticipantInfo>>();

// simple in-memory whiteboard op log per meeting (cleared when room empties)
const whiteboardState = new Map<string, any[]>();

const authenticateSocket = (socket: Socket): { id: string } | null => {
  try {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers.authorization || "").replace("Bearer ", "");
    if (!token) return null;
    return jwt.verify(token, env.JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
};

export const initSocket = (io: IOServer) => {
  io.use((socket, next) => {
    const decoded = authenticateSocket(socket);
    if (!decoded) return next(new Error("Unauthorized"));
    (socket as any).userId = decoded.id;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    let currentMeetingId: string | null = null;

    socket.on(
      "meeting:join",
      async ({ meetingId, name, micOn, camOn }: { meetingId: string; name: string; micOn: boolean; camOn: boolean }) => {
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting || meeting.status === "ended") {
          socket.emit("meeting:error", { message: "Meeting no longer exists" });
          return;
        }

        currentMeetingId = meetingId;
        socket.join(meetingId);

        if (!rooms.has(meetingId)) rooms.set(meetingId, new Map());
        const room = rooms.get(meetingId)!;

        const isHost = meeting.host.toString() === userId;
        const existingParticipants = Array.from(room.values());

        const me: ParticipantInfo = {
          socketId: socket.id,
          userId,
          name,
          micOn,
          camOn,
          isHost,
        };
        room.set(socket.id, me);

        if (!meeting.participants.some((p) => p.toString() === userId)) {
          meeting.participants.push(userId as any);
          await meeting.save();
        }

        // send existing participants + whiteboard state to the new joiner
        socket.emit("meeting:joined", {
          participants: existingParticipants,
          whiteboardOps: whiteboardState.get(meetingId) || [],
        });

        // tell everyone else about the new participant
        socket.to(meetingId).emit("participant:joined", me);
      }
    );

    socket.on("webrtc:offer", ({ to, sdp }: { to: string; sdp: any }) => {
      io.to(to).emit("webrtc:offer", { from: socket.id, sdp });
    });

    socket.on("webrtc:answer", ({ to, sdp }: { to: string; sdp: any }) => {
      io.to(to).emit("webrtc:answer", { from: socket.id, sdp });
    });

    socket.on("webrtc:ice-candidate", ({ to, candidate }: { to: string; candidate: any }) => {
      io.to(to).emit("webrtc:ice-candidate", { from: socket.id, candidate });
    });

    socket.on("participant:media-state", ({ micOn, camOn }: { micOn: boolean; camOn: boolean }) => {
      if (!currentMeetingId) return;
      const room = rooms.get(currentMeetingId);
      const p = room?.get(socket.id);
      if (p) {
        p.micOn = micOn;
        p.camOn = camOn;
      }
      socket.to(currentMeetingId).emit("participant:media-state", {
        socketId: socket.id,
        micOn,
        camOn,
      });
    });

    socket.on("chat:message", async ({ content }: { content: string }) => {
      if (!currentMeetingId || !content?.trim()) return;
      const meeting = await Meeting.findOne({ meetingId: currentMeetingId });
      if (!meeting) return;
      const saved = await Message.create({
        meeting: meeting._id,
        sender: userId,
        content: content.trim().slice(0, 2000),
      });
      const populated = await saved.populate("sender", "name avatar");
      io.to(currentMeetingId).emit("chat:message", populated);
    });

    socket.on("whiteboard:draw", (op: any) => {
      if (!currentMeetingId) return;
      if (!whiteboardState.has(currentMeetingId)) whiteboardState.set(currentMeetingId, []);
      whiteboardState.get(currentMeetingId)!.push(op);
      socket.to(currentMeetingId).emit("whiteboard:draw", op);
    });

    socket.on("whiteboard:clear", () => {
      if (!currentMeetingId) return;
      whiteboardState.set(currentMeetingId, []);
      socket.to(currentMeetingId).emit("whiteboard:clear");
    });

    socket.on("file:shared", (fileMeta: any) => {
      if (!currentMeetingId) return;
      socket.to(currentMeetingId).emit("file:shared", fileMeta);
    });

    const leaveRoom = () => {
      if (!currentMeetingId) return;
      const room = rooms.get(currentMeetingId);
      room?.delete(socket.id);
      socket.to(currentMeetingId).emit("participant:left", { socketId: socket.id });
      if (room && room.size === 0) {
        rooms.delete(currentMeetingId);
        whiteboardState.delete(currentMeetingId);
      }
      currentMeetingId = null;
    };

    socket.on("meeting:leave", leaveRoom);
    socket.on("disconnect", leaveRoom);
  });
};
