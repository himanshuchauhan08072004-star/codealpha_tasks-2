import { RemoteParticipant } from "../../types";

interface Props {
  localName: string;
  localMicOn: boolean;
  localCamOn: boolean;
  isHost: boolean;
  participants: Record<string, RemoteParticipant>;
  onClose: () => void;
}

const ParticipantPanel = ({ localName, localMicOn, localCamOn, isHost, participants, onClose }: Props) => {
  const list = Object.values(participants);
  return (
    <div className="w-72 bg-panel border-l border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-medium">Participants ({list.length + 1})</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-200 bg-white/5 rounded-lg px-3 py-2">
          <span>{isHost ? "👑 " : ""}{localName} (You)</span>
          <span>{localMicOn ? "🎤" : "🔇"} {localCamOn ? "📷" : "🚫"}</span>
        </div>
        {list.map((p) => (
          <div key={p.socketId} className="flex items-center justify-between text-sm text-gray-200 bg-white/5 rounded-lg px-3 py-2">
            <span>{p.isHost ? "👑 " : ""}{p.name}</span>
            <span>{p.micOn ? "🎤" : "🔇"} {p.camOn ? "📷" : "🚫"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantPanel;
