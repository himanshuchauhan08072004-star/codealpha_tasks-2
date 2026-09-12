export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  meetingId: string;
  host: string | User;
  participants: (string | User)[];
  status: "active" | "ended";
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  meeting: string;
  sender: { _id: string; name: string; avatar?: string } | string;
  content: string;
  createdAt: string;
}

export interface SharedFileMeta {
  _id: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploader: { _id: string; name: string } | string;
  createdAt: string;
}

export interface RemoteParticipant {
  socketId: string;
  userId: string;
  name: string;
  micOn: boolean;
  camOn: boolean;
  isHost: boolean;
  stream?: MediaStream;
}

export interface WhiteboardOp {
  type: "stroke";
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: "pen" | "eraser";
}
