import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <form onSubmit={onSubmit} className="bg-panel rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6">Log in to ConnectHub</h1>
        {error && (
          <div className="bg-danger/20 text-red-300 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}
        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-surface border border-white/10 text-white"
        />
        <label className="block text-sm text-gray-400 mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded-lg bg-surface border border-white/10 text-white"
        />
        <button
          disabled={loading}
          className="w-full py-2 rounded-lg bg-accent text-white font-medium disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p className="text-gray-400 text-sm mt-4 text-center">
          No account?{" "}
          <Link to="/register" className="text-accent">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
