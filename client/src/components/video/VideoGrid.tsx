import VideoTile from "./VideoTile";
import { RemoteParticipant } from "../../types";

interface Props {
  localStream: MediaStream | null;
  localName: string;
  micOn: boolean;
  camOn: boolean;
  isHost: boolean;
  participants: Record<string, RemoteParticipant>;
  screenShareStream?: MediaStream | null;
  screenShareName?: string;
}

const VideoGrid = ({
  localStream,
  localName,
  micOn,
  camOn,
  isHost,
  participants,
  screenShareStream,
  screenShareName,
}: Props) => {
  const remoteList = Object.values(participants);

  if (screenShareStream) {
    return (
      <div className="flex-1 p-4 flex gap-3 overflow-hidden">
        <div className="flex-1">
          <VideoTile
            stream={screenShareStream}
            name={screenShareName || "Screen share"}
            micOn={true}
            camOn={true}
          />
        </div>
        <div className="w-40 flex flex-col gap-2 overflow-y-auto">
          <VideoTile stream={localStream || undefined} name={localName} micOn={micOn} camOn={camOn} isLocal isHost={isHost} />
          {remoteList.map((p) => (
            <VideoTile key={p.socketId} stream={p.stream} name={p.name} micOn={p.micOn} camOn={p.camOn} isHost={p.isHost} />
          ))}
        </div>
      </div>
    );
  }

  const count = remoteList.length + 1;
  const cols = count <= 1 ? "grid-cols-1" : count <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={`flex-1 p-4 grid ${cols} gap-3 auto-rows-fr overflow-y-auto`}>
      <VideoTile stream={localStream || undefined} name={localName} micOn={micOn} camOn={camOn} isLocal isHost={isHost} />
      {remoteList.map((p) => (
        <VideoTile key={p.socketId} stream={p.stream} name={p.name} micOn={p.micOn} camOn={p.camOn} isHost={p.isHost} />
      ))}
    </div>
  );
};

export default VideoGrid;
