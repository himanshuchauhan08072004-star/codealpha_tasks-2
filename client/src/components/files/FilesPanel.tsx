import { ChangeEvent, useEffect, useState } from "react";
import { api } from "../../services/api";
import { getSocket } from "../../services/socket";
import { SharedFileMeta } from "../../types";

interface Props {
  meetingId: string;
  onClose: () => void;
}

const MAX_MB = 10;

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilesPanel = ({ meetingId, onClose }: Props) => {
  const [files, setFiles] = useState<SharedFileMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/meetings/${meetingId}/files`).then((res) => setFiles(res.data)).catch(() => {});
    const socket = getSocket();
    const handler = (fileMeta: SharedFileMeta) => setFiles((prev) => [...prev, fileMeta]);
    socket.on("file:shared", handler);
    return () => {
      socket.off("file:shared", handler);
    };
  }, [meetingId]);

  const onSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Max ${MAX_MB} MB.`);
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await api.post(`/meetings/${meetingId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setFiles((prev) => [...prev, data]);
      getSocket().emit("file:shared", data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unsupported file type or upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const download = async (file: SharedFileMeta) => {
    const res = await api.get(`/files/${file._id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.originalName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-80 bg-panel border-l border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-medium">Shared Files</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <div className="p-3 border-b border-white/10">
        <label className="block w-full text-center px-3 py-2 rounded-lg bg-accent text-white text-sm cursor-pointer">
          Upload File
          <input type="file" className="hidden" onChange={onSelect} />
        </label>
        {uploading && (
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {files.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-6">No files shared yet.</p>
        )}
        {files.map((f) => {
          const uploaderName = typeof f.uploader === "string" ? "User" : f.uploader.name;
          return (
            <div key={f._id} className="bg-white/5 rounded-lg p-3 text-sm">
              <div className="text-white break-words">📄 {f.originalName}</div>
              <div className="text-gray-500 text-xs mt-1">
                {formatSize(f.size)} · {uploaderName}
              </div>
              <button
                onClick={() => download(f)}
                className="mt-2 w-full py-1.5 rounded-lg bg-white/10 text-gray-200 text-xs"
              >
                Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilesPanel;
