import { FormEvent, useEffect, useRef, useState } from "react";
import { getSocket } from "../../services/socket";
import { ChatMessage } from "../../types";

interface Props {
  meetingId: string;
  currentUserId: string;
  onClose: () => void;
}

const ChatPanel = ({ meetingId, currentUserId, onClose }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    const handler = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);
    socket.on("chat:message", handler);
    return () => {
      socket.off("chat:message", handler);
    };
  }, [meetingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    getSocket().emit("chat:message", { content: trimmed.slice(0, 2000) });
    setText("");
  };

  return (
    <div className="w-80 bg-panel border-l border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-medium">Chat</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-6">No messages yet.</p>
        )}
        {messages.map((m) => {
          const senderId = typeof m.sender === "string" ? m.sender : m.sender._id;
          const senderName = typeof m.sender === "string" ? "User" : m.sender.name;
          const mine = senderId === currentUserId;
          return (
            <div key={m._id} className={`text-sm ${mine ? "text-right" : ""}`}>
              <div className="text-gray-500 text-xs mb-0.5">
                {senderName} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div
                className={`inline-block px-3 py-1.5 rounded-lg max-w-[85%] break-words ${
                  mine ? "bg-accent text-white" : "bg-white/10 text-gray-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-white/10 text-white text-sm"
        />
        <button className="px-3 py-2 rounded-lg bg-accent text-white text-sm">Send</button>
      </form>
    </div>
  );
};

export default ChatPanel;
