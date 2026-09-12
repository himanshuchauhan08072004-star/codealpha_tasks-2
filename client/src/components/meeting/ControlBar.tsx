interface Props {
  micOn: boolean;
  camOn: boolean;
  screenSharing: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleWhiteboard: () => void;
  onToggleFiles: () => void;
  onLeave: () => void;
}

const Btn = ({
  active,
  danger,
  onClick,
  label,
  icon,
}: {
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition ${
      danger
        ? "bg-danger text-white"
        : active
        ? "bg-white/10 text-white"
        : "bg-white/5 text-gray-400"
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="hidden sm:block">{label}</span>
  </button>
);

const ControlBar = ({
  micOn,
  camOn,
  screenSharing,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onToggleFiles,
  onLeave,
}: Props) => (
  <div className="flex items-center justify-center gap-2 px-3 py-3 bg-panel border-t border-white/10 flex-wrap">
    <Btn active={micOn} onClick={onToggleMic} label={micOn ? "Mute" : "Unmute"} icon={micOn ? "🎤" : "🔇"} />
    <Btn active={camOn} onClick={onToggleCam} label={camOn ? "Stop Video" : "Start Video"} icon={camOn ? "📷" : "🚫"} />
    <Btn active={screenSharing} onClick={onToggleScreenShare} label="Share" icon="🖥" />
    <Btn onClick={onToggleChat} label="Chat" icon="💬" />
    <Btn onClick={onToggleParticipants} label="People" icon="👥" />
    <Btn onClick={onToggleWhiteboard} label="Whiteboard" icon="🎨" />
    <Btn onClick={onToggleFiles} label="Files" icon="📁" />
    <button
      onClick={onLeave}
      className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs bg-danger text-white"
    >
      <span className="text-lg">📞</span>
      <span className="hidden sm:block">Leave</span>
    </button>
  </div>
);

export default ControlBar;
