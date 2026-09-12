import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Meeting } from "../types";
import ThemeToggle from "../components/ui/ThemeToggle";
import OrbitVisual from "../components/dashboard/OrbitVisual";
import { VideoIcon, ScreenIcon, ChatIcon, PencilIcon, FileIcon, UserIcon, LogoMark } from "../components/ui/icons";

const QUICK_FEATURES = [
  { label: "Video Call", Icon: VideoIcon },
  { label: "Screen Share", Icon: ScreenIcon },
  { label: "Chat", Icon: ChatIcon },
  { label: "Whiteboard", Icon: PencilIcon },
  { label: "File Share", Icon: FileIcon },
  { label: "Participants", Icon: UserIcon },
];

const initials = (name?: string) => (name || "?").trim().charAt(0).toUpperCase();

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [title, setTitle] = useState("");
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api
      .get("/meetings/recent")
      .then((res) => setMeetings(res.data))
      .catch(() => {});
  }, []);

  const createMeeting = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/meetings", { title: title || "Untitled Meeting" });
      navigate(`/lobby/${data.meetingId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create meeting");
    }
  };

  const joinMeeting = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!joinId.trim()) return;
    try {
      await api.get(`/meetings/${joinId.trim()}`);
      navigate(`/lobby/${joinId.trim()}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Meeting not found");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="bg-blobs" />
      <div className="bg-grid" />

      <div className="relative z-10">
        <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <LogoMark width={30} height={30} />
            <span className="font-display font-semibold text-ink tracking-tight">ConnectHub</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-violet text-white flex items-center justify-center font-medium text-sm"
              >
                {initials(user?.name)}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl glass shadow-glow overflow-hidden">
                  <div className="px-3 py-2 text-xs text-muted border-b border-border truncate">{user?.email}</div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-panel2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-panel2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <section className="flex items-center justify-between gap-8 mb-12">
            <div className="max-w-xl">
              <p className="text-muted text-sm mb-2">Welcome back,</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-3">
                {user?.name}
              </h1>
              <p className="text-muted">
                Connect, collaborate and create together. Start a new meeting or join one
                already in progress.
              </p>
            </div>
            <OrbitVisual />
          </section>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-4 py-2.5 mb-6">
              {error}
            </div>
          )}

          <section className="grid md:grid-cols-2 gap-5 mb-6">
            <form
              onSubmit={createMeeting}
              className="rounded-2xl border border-border bg-panel/60 p-6 hover:border-accent/40 hover:-translate-y-0.5 transition-all shadow-glow"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4">
                <VideoIcon width={20} height={20} />
              </div>
              <h2 className="text-ink font-display font-medium mb-1">Create Meeting</h2>
              <p className="text-muted text-sm mb-4">Start a new meeting and invite your team.</p>
              <input
                placeholder="Meeting title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mb-3 px-3.5 py-2.5 rounded-lg bg-surface border border-border text-ink text-sm placeholder:text-muted focus:border-accent/60"
              />
              <button className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:brightness-110 transition">
                + Create Meeting
              </button>
            </form>

            <form
              onSubmit={joinMeeting}
              className="rounded-2xl border border-border bg-panel/60 p-6 hover:border-violet/40 hover:-translate-y-0.5 transition-all shadow-glow"
            >
              <div className="w-11 h-11 rounded-xl bg-violet/15 text-violet flex items-center justify-center mb-4">
                <ScreenIcon width={20} height={20} />
              </div>
              <h2 className="text-ink font-display font-medium mb-1">Join Meeting</h2>
              <p className="text-muted text-sm mb-4">Enter a meeting ID to join an existing meeting.</p>
              <div className="flex gap-2">
                <input
                  placeholder="Meeting ID"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-surface border border-border text-ink text-sm placeholder:text-muted focus:border-violet/60"
                />
                <button className="px-5 py-2.5 rounded-lg bg-violet text-white font-medium text-sm hover:brightness-110 transition">
                  Join
                </button>
              </div>
            </form>
          </section>

          <section className="flex flex-wrap gap-2 mb-12">
            {QUICK_FEATURES.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-border bg-panel/40 text-muted text-xs hover:text-ink hover:border-accent/40 transition-colors"
              >
                <Icon width={14} height={14} />
                {label}
              </div>
            ))}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-ink font-medium">Recent Meetings</h2>
            </div>

            {meetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center text-muted text-sm">
                No meetings yet — create one above to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {meetings.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-panel/40 px-4 py-3.5 hover:bg-panel2/60 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          m.status === "active" ? "bg-success" : "bg-muted"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-ink text-sm font-medium truncate">{m.title}</div>
                        <div className="text-muted text-xs">
                          {m.participants.length} participant{m.participants.length === 1 ? "" : "s"} ·{" "}
                          {timeAgo(m.createdAt)} · {m.status}
                        </div>
                      </div>
                    </div>
                    {m.status === "active" && (
                      <button
                        onClick={() => navigate(`/lobby/${m.meetingId}`)}
                        className="shrink-0 text-xs px-3.5 py-1.5 rounded-lg bg-accent text-white font-medium hover:brightness-110 transition"
                      >
                        Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
