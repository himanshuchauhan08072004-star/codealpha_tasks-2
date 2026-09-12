import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="text-xl font-bold text-white">ConnectHub</div>
        <div className="space-x-3">
          {user ? (
            <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-accent text-white">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg text-gray-200">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-accent text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Meet, share, and whiteboard — in real time.
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Video calls, screen sharing, live chat, collaborative whiteboard and file
          sharing, all in one lightweight room.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="px-6 py-3 rounded-lg bg-accent text-white font-medium"
          >
            Create a Meeting
          </Link>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="px-6 py-3 rounded-lg bg-panel text-gray-200 font-medium"
          >
            Join a Meeting
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-20 text-left">
          {[
            ["Multi-user video", "Real peer-to-peer WebRTC calls, no fake tiles."],
            ["Screen sharing", "Share your screen instantly with the room."],
            ["Live chat", "Message the room without breaking focus."],
            ["Whiteboard", "Draw together, synced in real time."],
            ["File sharing", "Drop a file, everyone can grab it."],
            ["Secure by default", "JWT auth, encrypted media transport."],
          ].map(([title, desc]) => (
            <div key={title} className="bg-panel rounded-xl p-5">
              <div className="text-white font-semibold mb-1">{title}</div>
              <div className="text-gray-400 text-sm">{desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
