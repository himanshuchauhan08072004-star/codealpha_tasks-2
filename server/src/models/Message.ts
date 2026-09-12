import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  meeting: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
