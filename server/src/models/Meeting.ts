import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMeeting extends Document {
  title: string;
  meetingId: string;
  host: Types.ObjectId;
  participants: Types.ObjectId[];
  status: "active" | "ended";
  createdAt: Date;
  endedAt?: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    meetingId: { type: String, required: true, unique: true, index: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["active", "ended"], default: "active" },
    endedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IMeeting>("Meeting", MeetingSchema);
