import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { resetPassword } from "../../../api/auth";
import { Lock, Cpu, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black p-4">
      <div className="max-w-md w-full bg-black/50 backdrop-blur border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_25px_rgba(0,242,255,0.2)]">
        <button onClick={() => navigate("/login")} className="text-cyan-400 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> BACK
        </button>
        <Cpu className="text-cyan-400 w-10 h-10 mx-auto mb-3" />
        <h2 className="text-2xl font-mono text-cyan-400 text-center mb-2">RESET_KEY</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Set a new encryption key for your node.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New encryption key"
              className="w-full bg-black/50 border border-cyan-500/50 rounded-md py-2 pl-10 pr-3 text-cyan-100 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm encryption key"
              className="w-full bg-black/50 border border-cyan-500/50 rounded-md py-2 pl-10 pr-3 text-cyan-100 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          {message && <div className="text-green-400 text-sm">{message}</div>}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400 text-cyan-300 font-mono py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? "RESETTING..." : "RESET_KEY"}
          </button>
        </form>
      </div>
    </div>
  );
}