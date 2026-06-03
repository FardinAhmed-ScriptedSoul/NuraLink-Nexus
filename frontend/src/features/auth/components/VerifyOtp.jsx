import { useState } from "react";
import { useNavigate } from "react-router";
import { registerVerify } from "../../../api/auth";
import { useAuth } from "../../../context/AuthContext";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem("registerEmail");
    if (!email) {
      setError("Session expired. Please register again.");
      navigate("/register");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await registerVerify({ email, token: otp });
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black p-4">
      <div className="max-w-md w-full bg-black/50 backdrop-blur border border-cyan-500/30 rounded-2xl p-8 text-center shadow-[0_0_25px_rgba(0,242,255,0.2)]">
        <div className="flex justify-start mb-2">
          <button
            onClick={() => navigate("/register")}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm"
          >
            <ArrowLeft size={16} /> BACK
          </button>
        </div>
        <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-mono text-cyan-400 mb-2">VERIFY_CHALLENGE</h2>
        <p className="text-gray-400 text-sm mb-6">
          Enter the 6-digit token dispatched to your neural interface.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full text-center text-2xl tracking-widest bg-black/50 border border-cyan-500/50 rounded-md py-3 text-cyan-100 focus:outline-none focus:border-cyan-400"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400 text-cyan-300 font-mono py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? "VERIFYING..." : "VERIFY_AND_ACTIVATE"}
          </button>
        </form>
      </div>
    </div>
  );
}