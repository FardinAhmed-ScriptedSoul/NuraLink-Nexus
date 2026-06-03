import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useRegister } from "../hooks/useAuth";
import Panel from "./Panel";
import { User, Mail, Lock, Key, AlertCircle, Activity, Signal, LogOut, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    securityKeyphrase: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error } = useRegister();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <div className="min-h-screen bg-[#030708] text-cyan-100 font-mono flex flex-col justify-between overflow-x-hidden relative select-none">
      <header className="w-full border-b border-cyan-500/20 bg-black/40 backdrop-blur px-6 py-3 flex justify-between items-center z-20">
        <span className="text-cyan-400 font-bold text-xl tracking-widest animate-pulse">NEURAL_OS_v4.2</span>
        <div className="flex items-center gap-6 text-cyan-500/60">
          <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
          <Signal className="w-4 h-4" />
          <LogOut className="w-4 h-4" />
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1800px] mx-auto p-6 gap-6 relative z-10">
        <Panel />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#070d10]/80 backdrop-blur border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-widest text-cyan-100">REGISTER_NODE</h2>
              <p className="text-xs text-cyan-500/60 mt-1 tracking-wider">ALLOCATE_BIOMETRIC_IDENTITY_VAULT</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-cyan-400 text-[10px] uppercase tracking-widest">OPERATOR_ALIAS</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-cyan-500/50" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-md py-2 pl-10 pr-3 text-cyan-100 focus:outline-none focus:border-cyan-400 transition text-xs"
                    placeholder="Operator Alias"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-cyan-400 text-[10px] uppercase tracking-widest">IDENTITY_SIGNATURE</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-cyan-500/50" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-md py-2 pl-10 pr-3 text-cyan-100 focus:outline-none focus:border-cyan-400 transition text-xs"
                    placeholder="neural@link.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-cyan-400 text-[10px] uppercase tracking-widest">ENCRYPTION_HASH</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-cyan-500/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-md py-2 pl-10 pr-10 text-cyan-100 focus:outline-none focus:border-cyan-400 transition text-xs"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-cyan-500/50 hover:text-cyan-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-cyan-400 text-[10px] uppercase tracking-widest">BIOMETRIC_VECTOR_PHRASE</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-cyan-500/50" />
                  <input
                    type="text"
                    name="securityKeyphrase"
                    value={form.securityKeyphrase}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-md py-2 pl-10 pr-3 text-cyan-100 focus:outline-none focus:border-cyan-400 transition text-xs"
                    placeholder="e.g., 'my voice is my password'"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/20 border border-red-500/30 p-2.5 rounded">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-black hover:bg-cyan-300 font-bold py-2.5 rounded-md transition-all duration-300 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] disabled:opacity-50 tracking-widest text-xs uppercase"
              >
                {loading ? "STAGING..." : "STAGE_REGISTRATION"}
              </button>

              <div className="text-center text-[11px] text-cyan-500/50 pt-2">
                Already have a node?{" "}
                <Link to="/login" className="text-cyan-400 hover:underline">RETURN_TO_GATE</Link>
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