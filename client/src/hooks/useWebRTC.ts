import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";
import { RemoteParticipant, WhiteboardOp } from "../types";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface PeerEntry {
  pc: RTCPeerConnection;
  candidateQueue: RTCIceCandidateInit[];
}

export const useWebRTC = (
  meetingId: string | null,
  localStream: MediaStream | null,
  displayName: string,
  micOn: boolean,
  camOn: boolean
) => {
  const [participants, setParticipants] = useState<Record<string, RemoteParticipant>>({});
  const [joined, setJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [initialWhiteboardOps, setInitialWhiteboardOps] = useState<WhiteboardOp[]>([]);

  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);
  localStreamRef.current = localStream;

  const createPeerConnection = useCallback(
    (remoteSocketId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          getSocket().emit("webrtc:ice-candidate", {
            to: remoteSocketId,
            candidate: e.candidate,
          });
        }
      };

      pc.ontrack = (e) => {
        setParticipants((prev) => {
          const existing = prev[remoteSocketId];
          if (!existing) return prev;
          return {
            ...prev,
            [remoteSocketId]: { ...existing, stream: e.streams[0] },
          };
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          // leave cleanup to participant:left / disconnect handlers
        }
      };

      peersRef.current.set(remoteSocketId, { pc, candidateQueue: [] });
      return pc;
    },
    []
  );

  const closePeer = useCallback((socketId: string) => {
    const entry = peersRef.current.get(socketId);
    entry?.pc.close();
    peersRef.current.delete(socketId);
  }, []);

  useEffect(() => {
    if (!meetingId || !localStream) return;

    const socket = getSocket();
    socket.auth = { token: localStorage.getItem("ch_token") };
    if (!socket.connected) socket.connect();

    const handleJoined = ({
      participants: existing,
      whiteboardOps,
    }: {
      participants: RemoteParticipant[];
      whiteboardOps: WhiteboardOp[];
    }) => {
      setJoined(true);
      setInitialWhiteboardOps(whiteboardOps || []);
      const map: Record<string, RemoteParticipant> = {};
      existing.forEach((p) => (map[p.socketId] = p));
      setParticipants(map);

      // we are the new joiner: initiate offers to everyone already present
      existing.forEach(async (p) => {
        const pc = createPeerConnection(p.socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { to: p.socketId, sdp: offer });
      });
    };

    const handleParticipantJoined = (p: RemoteParticipant) => {
      setParticipants((prev) => ({ ...prev, [p.socketId]: p }));
      // wait for their offer; peer connection created in handleOffer
    };

    const handleOffer = async ({ from, sdp }: { from: string; sdp: any }) => {
      let entry = peersRef.current.get(from);
      const pc = entry ? entry.pc : createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      entry = peersRef.current.get(from)!;
      for (const cand of entry.candidateQueue) {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }
      entry.candidateQueue = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { to: from, sdp: answer });
    };

    const handleAnswer = async ({ from, sdp }: { from: string; sdp: any }) => {
      const entry = peersRef.current.get(from);
      if (!entry) return;
      await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      for (const cand of entry.candidateQueue) {
        await entry.pc.addIceCandidate(new RTCIceCandidate(cand));
      }
      entry.candidateQueue = [];
    };

    const handleIceCandidate = async ({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const entry = peersRef.current.get(from);
      if (!entry) return;
      if (entry.pc.remoteDescription) {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        entry.candidateQueue.push(candidate);
      }
    };

    const handleParticipantLeft = ({ socketId }: { socketId: string }) => {
      closePeer(socketId);
      setParticipants((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const handleMediaState = ({
      socketId,
      micOn: m,
      camOn: c,
    }: {
      socketId: string;
      micOn: boolean;
      camOn: boolean;
    }) => {
      setParticipants((prev) => {
        const existing = prev[socketId];
        if (!existing) return prev;
        return { ...prev, [socketId]: { ...existing, micOn: m, camOn: c } };
      });
    };

    const handleMeetingError = ({ message }: { message: string }) => {
      setConnectionError(message);
    };

    socket.on("meeting:joined", handleJoined);
    socket.on("participant:joined", handleParticipantJoined);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);
    socket.on("participant:left", handleParticipantLeft);
    socket.on("participant:media-state", handleMediaState);
    socket.on("meeting:error", handleMeetingError);

    socket.emit("meeting:join", { meetingId, name: displayName, micOn, camOn });

    return () => {
      socket.emit("meeting:leave");
      socket.off("meeting:joined", handleJoined);
      socket.off("participant:joined", handleParticipantJoined);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
      socket.off("participant:left", handleParticipantLeft);
      socket.off("participant:media-state", handleMediaState);
      socket.off("meeting:error", handleMeetingError);
      peersRef.current.forEach((entry) => entry.pc.close());
      peersRef.current.clear();
      setParticipants({});
      setJoined(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, localStream, createPeerConnection, closePeer]);

  const broadcastMediaState = useCallback((mic: boolean, cam: boolean) => {
    getSocket().emit("participant:media-state", { micOn: mic, camOn: cam });
  }, []);

  const replaceVideoTrack = useCallback((newTrack: MediaStreamTrack | null) => {
    peersRef.current.forEach((entry) => {
      const sender = entry.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && newTrack) sender.replaceTrack(newTrack);
    });
  }, []);

  return {
    participants,
    joined,
    connectionError,
    initialWhiteboardOps,
    broadcastMediaState,
    replaceVideoTrack,
  };
};
