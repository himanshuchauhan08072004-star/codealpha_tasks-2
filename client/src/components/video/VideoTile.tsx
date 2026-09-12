import { useEffect, useRef } from "react";

interface Props {
  stream?: MediaStream;
  name: string;
  micOn: boolean;
  camOn: boolean;
  isLocal?: boolean;
  isHost?: boolean;
}

const VideoTile = ({ stream, name, micOn, camOn, isLocal, isHost }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
      {camOn && stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-panel">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 rounded-lg px-2 py-1 text-xs text-white">
        {isHost && <span title="Host">👑</span>}
        <span>{name}{isLocal ? " (You)" : ""}</span>
        <span>{micOn ? "🎤" : "🔇"}</span>
      </div>
    </div>
  );
};

export default VideoTile;
