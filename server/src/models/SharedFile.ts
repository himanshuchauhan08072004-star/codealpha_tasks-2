import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISharedFile extends Document {
  meeting: Types.ObjectId;
  uploader: Types.ObjectId;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
}

const SharedFileSchema = new Schema<ISharedFile>(
  {
    meeting: { type: Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ISharedFile>("SharedFile", SharedFileSchema);
