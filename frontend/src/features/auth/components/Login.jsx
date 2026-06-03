import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLogin } from "../hooks/useAuth";
import Panel from "./Panel";
import { Lock, Mail, AlertCircle, Activity, Signal, LogOut, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useLogin();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-[#030708] text-cyan-100 font-mono flex flex-col justify-between overflow-x-hidden relative select-none">
      <header className="w-full border-b border-cyan-500/20 bg-black/40 backdrop-blur px-6 py-3 flex justify-between items-center z-20">
        <span className="text-cyan-400 font-bold text-xl tracking-widest animate-pulse">NEURAL_OS_v4.2</span>
        <div className="flex items-center gap-6 text-cyan-500/60">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <Signal className="w-4 h-4" />
          <LogOut className="w-4 h-4" />
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1800px] mx-auto p-6 gap-6 relative z-10">
        <Panel />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#070d10]/80 backdrop-blur border border-cyan-500/20 rounded-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-widest text-cyan-100">IDENTITY_GATE</h2>
              <p className="text-xs text-cyan-500/60 mt-1 tracking-wider">ENTER_CREDENTIALS_TO_ACTIVATE_CORE</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-cyan-400 text-xs tracking-widest">ACCESS_IDENTIFIER</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan-500/50" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-md py-2.5 pl-10 pr-3 text-cyan-100 focus:outline-none focus:border-cyan-400 transition text-sm"
                    placeholder="UID-8821-XX"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-cyan-400 text-xs tracking-widest">ENCRYPTION_KEY</label>
                  <Link to="/forgot-password" className="text-[10px] text-cyan-500/50 hover:text-cyan-300 transition">FORGOT_UID?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan-500/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-md py-2.5 pl-10 pr-10 text-cyan-100 focus:outline-none focus:border-cyan-400 transition text-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-cyan-500/50 hover:text-cyan-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/20 border border-red-500/30 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-black hover:bg-cyan-300 font-bold py-3 rounded-md transition-all duration-300 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] disabled:opacity-50 tracking-widest text-sm uppercase"
              >
                {loading ? "CONNECTING..." : "INITIALIZE_SESSION"}
              </button>

              <div className="flex justify-between items-center pt-2 text-[11px] text-cyan-500/50">
                <Link to="/forgot-password" className="hover:text-cyan-300 transition">FORGOT_UID?</Link>
                <Link to="/register" className="hover:text-cyan-300 transition">REGISTER_NEW_NODE</Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-cyan-500/10 bg-black/60 px-6 py-2 flex flex-wrap justify-between text-[10px] text-cyan-600/50 z-20">
        <div className="flex gap-4">
          <span>● SYSTEM_LIVE</span>
          <span>PING: 14ms</span>
          <span>{currentTime || "SYNCING..."}</span>
        </div>
        <div className="flex gap-4">
          <span>LOCATION: [40.7128° N, 74.0060° W]</span>
          <span className="text-cyan-400/50">V_CORE: v4.2.1-stable</span>
        </div>
      </footer>
    </div>
  );
}