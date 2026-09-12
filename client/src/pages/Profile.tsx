import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="max-w-md mx-auto bg-panel rounded-xl p-6">
        <h1 className="text-xl font-bold text-white mb-4">Profile</h1>
        <div className="space-y-2 text-gray-300 text-sm mb-6">
          <div><span className="text-gray-500">Name:</span> {user?.name}</div>
          <div><span className="text-gray-500">Email:</span> {user?.email}</div>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-2 rounded-lg bg-white/10 text-gray-200 mb-2"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="w-full py-2 rounded-lg bg-danger text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
