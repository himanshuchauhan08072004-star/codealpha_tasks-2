import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMediaDevices } from "../hooks/useMediaDevices";
import { api } from "../services/api";

const Lobby = () => {
  const { meetingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localStream, micOn, camOn, error, start, toggleMic, toggleCam } = useMediaDevices();
  const [meetingTitle, setMeetingTitle] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    start();
    api
      .get(`/meetings/${meetingId}`)
      .then((res) => setMeetingTitle(res.data.title))
      .catch(() => setNotFound(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const join = () => {
    navigate(`/meeting/${meetingId}`, { state: { micOn, camOn } });
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-gray-300">
        Meeting no longer exists.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-panel rounded-xl p-6 w-full max-w-md text-center">
        <h1 className="text-xl font-bold text-white mb-1">Ready to join?</h1>
        <p className="text-gray-400 text-sm mb-4">{meetingTitle || "Loading..."}</p>

        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
          {camOn ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Camera off
            </div>
          )}
        </div>

        {error && (
          <div className="bg-danger/20 text-red-300 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={toggleMic}
            className={`px-4 py-2 rounded-lg text-sm ${
              micOn ? "bg-white/10 text-white" : "bg-danger text-white"
            }`}
          >
            {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
          </button>
          <button
            onClick={toggleCam}
            className={`px-4 py-2 rounded-lg text-sm ${
              camOn ? "bg-white/10 text-white" : "bg-danger text-white"
            }`}
          >
            {camOn ? "📷 Camera On" : "📷 Camera Off"}
          </button>
        </div>

        <div className="text-gray-400 text-sm mb-4">Joining as {user?.name}</div>

        <button
          onClick={join}
          className="w-full py-2.5 rounded-lg bg-accent text-white font-medium"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
};

export default Lobby;
