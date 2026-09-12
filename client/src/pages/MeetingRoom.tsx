import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMediaDevices } from "../hooks/useMediaDevices";
import { useWebRTC } from "../hooks/useWebRTC";
import { api } from "../services/api";
import { disconnectSocket } from "../services/socket";
import VideoGrid from "../components/video/VideoGrid";
import ControlBar from "../components/meeting/ControlBar";
import ParticipantPanel from "../components/meeting/ParticipantPanel";
import ChatPanel from "../components/chat/ChatPanel";
import WhiteboardPanel from "../components/whiteboard/WhiteboardPanel";
import FilesPanel from "../components/files/FilesPanel";
import { Meeting } from "../types";

type Panel = "chat" | "participants" | "files" | null;

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const location = useLocation() as { state?: { micOn?: boolean; camOn?: boolean } };
  const navigate = useNavigate();
  const { user } = useAuth();

  const { localStream, micOn, camOn, error: mediaError, start, toggleMic, toggleCam, stop } =
    useMediaDevices();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const screenTrackRef = useRef<MediaStreamTrack | null>(null);

  const { participants, connectionError, initialWhiteboardOps, broadcastMediaState, replaceVideoTrack } =
    useWebRTC(meetingId || null, localStream, user?.name || "Guest", micOn, camOn);

  useEffect(() => {
    start();
    api.get(`/meetings/${meetingId}`).then((res) => setMeeting(res.data)).catch(() => {});
    return () => {
      stop();
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  useEffect(() => {
    broadcastMediaState(micOn, camOn);
  }, [micOn, camOn, broadcastMediaState]);

  useEffect(() => {
    if (connectionError) setToast(connectionError);
  }, [connectionError]);

  useEffect(() => {
    if (mediaError) setToast(mediaError);
  }, [mediaError]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const isHost = meeting && user ? (typeof meeting.host === "string" ? meeting.host : meeting.host.id) === user.id : false;

  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setToast("Screen sharing is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      screenTrackRef.current = track;
      setScreenStream(stream);
      setScreenSharing(true);
      replaceVideoTrack(track);
      track.onended = () => stopScreenShare();
    } catch {
      // user cancelled the picker — no-op
    }
  };

  const stopScreenShare = () => {
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setScreenStream(null);
    setScreenSharing(false);
    const camTrack = localStream?.getVideoTracks()[0];
    if (camTrack) replaceVideoTrack(camTrack);
  };

  const leave = async () => {
    if (isHost && meeting) {
      try {
        await api.patch(`/meetings/${meeting.meetingId}/end`);
      } catch {
        // non-host or already ended — ignore
      }
    }
    stop();
    disconnectSocket();
    navigate("/dashboard");
  };

  if (!meetingId) return null;

  return (
    <div className="h-screen flex flex-col bg-surface">
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="text-white font-medium truncate">{meeting?.title || "Meeting"}</div>
        <div className="text-gray-500 text-xs">ID: {meetingId}</div>
      </header>

      {toast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-panel border border-white/10 text-gray-100 text-sm px-4 py-2 rounded-lg z-30 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 flex relative overflow-hidden">
        <VideoGrid
          localStream={localStream}
          localName={user?.name || "You"}
          micOn={micOn}
          camOn={camOn}
          isHost={isHost}
          participants={participants}
          screenShareStream={screenStream}
          screenShareName={`${user?.name || "You"} (screen)`}
        />

        {panel === "participants" && (
          <ParticipantPanel
            localName={user?.name || "You"}
            localMicOn={micOn}
            localCamOn={camOn}
            isHost={isHost}
            participants={participants}
            onClose={() => setPanel(null)}
          />
        )}
        {panel === "chat" && (
          <ChatPanel meetingId={meetingId} currentUserId={user?.id || ""} onClose={() => setPanel(null)} />
        )}
        {panel === "files" && <FilesPanel meetingId={meetingId} onClose={() => setPanel(null)} />}

        {whiteboardOpen && (
          <WhiteboardPanel initialOps={initialWhiteboardOps} onClose={() => setWhiteboardOpen(false)} />
        )}
      </div>

      <ControlBar
        micOn={micOn}
        camOn={camOn}
        screenSharing={screenSharing}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleScreenShare={() => (screenSharing ? stopScreenShare() : startScreenShare())}
        onToggleChat={() => setPanel((p) => (p === "chat" ? null : "chat"))}
        onToggleParticipants={() => setPanel((p) => (p === "participants" ? null : "participants"))}
        onToggleWhiteboard={() => setWhiteboardOpen((v) => !v)}
        onToggleFiles={() => setPanel((p) => (p === "files" ? null : "files"))}
        onLeave={leave}
      />
    </div>
  );
};

export default MeetingRoom;
