import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { forgotPassword } from "../../../api/auth";
import { Mail, Cpu, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      setMessage(data.message || "Reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Request failed");
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
        <h2 className="text-2xl font-mono text-cyan-400 text-center mb-2">RECOVER_CREDENTIALS</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Enter your registered email to receive a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="neural@link.com"
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
            {loading ? "SENDING..." : "SEND_RESET_LINK"}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-gray-400">
          Remember your key?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">RETURN_TO_GATE</Link>
        </div>
      </div>
    </div>
  );
}