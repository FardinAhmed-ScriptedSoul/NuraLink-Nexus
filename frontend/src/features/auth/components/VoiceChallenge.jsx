import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useVerifyVoice } from "../hooks/useAuth";
import { Mic, AlertCircle, ArrowLeft, Cpu, ShieldCheck } from "lucide-react";

export default function VoiceChallenge() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [localError, setLocalError] = useState("");
  const { verify, loading, error: apiError } = useVerifyVoice();
  const navigate = useNavigate();

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setLocalError("Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.");
    }
  }, []);

  const startListening = () => {
    setLocalError("");
    setTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    
    recognition.onresult = async (event) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);
      setListening(false);

      const challengeId = sessionStorage.getItem("voiceChallengeId");
      if (!challengeId) {
        setLocalError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const sanitizedVoiceTranscript = spoken
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      try {
        await verify(challengeId, sanitizedVoiceTranscript);
      } catch (err) {
        // Errors preserved by useVerifyVoice state
      }
    };

    recognition.onerror = (e) => {
      setListening(false);
      setLocalError(`Recognition error: ${e.error}. Please try again.`);
    };

    recognition.start();
  };

  const activeError = localError || apiError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cyber-black bg-opacity-90">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 backdrop-blur-sm bg-black/30 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(0,242,255,0.2)]">
        
        {/* LEFT COLUMN: The Interactive Biometric Interface Terminal */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          
          {/* Header & Back Action */}
          <div>
            <div className="flex justify-start mb-4">
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs font-mono tracking-wider"
                disabled={loading}
              >
                <ArrowLeft size={14} /> ABORT_SESSION
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Cpu className="text-cyan-400 w-8 h-8" />
              <h2 className="text-2xl font-mono text-cyan-400 tracking-wider">BIOMETRIC_VOICE_GATE</h2>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              Verify your vocal biometric layout to establish connection permissions.
            </p>
          </div>

          {/* Core Scanner Interface */}
          <div className="flex flex-col items-center py-4 bg-black/20 border border-cyan-500/10 rounded-xl p-4">
            <button 
              onClick={startListening}
              disabled={listening || loading}
              className={`w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/40 transition-all duration-300 relative focus:outline-none ${
                listening ? "animate-pulse shadow-[0_0_30px_rgba(0,242,255,0.6)] border-cyan-400 scale-105" : "hover:border-cyan-400 hover:bg-cyan-500/20"
              }`}
            >
              <Mic className={`w-12 h-12 transition-colors ${listening ? "text-cyan-300" : "text-cyan-500"}`} />
            </button>
            <span className="text-xs font-mono text-gray-500 mt-4 tracking-widest">
              {listening ? "SCANNING STREAM..." : "AWAITING CORE INPUT"}
            </span>
          </div>

          {/* Real-time Sanitation Debug Deck */}
          {transcript && (
            <div className="p-3 bg-cyan-950/30 rounded border border-cyan-500/30 text-cyan-100 font-mono text-xs text-left space-y-1">
              <div><span className="text-cyan-400">RAW_CAPTURED:</span> "{transcript}"</div>
              <div><span className="text-purple-400">NORMALIZED:</span> "{transcript.toLowerCase().replace(/[^a-z0-9]/g, "")}"</div>
            </div>
          )}

          {/* Error Feedbacks */}
          {activeError && (
            <div className="text-red-400 text-xs font-mono flex items-center gap-2 bg-red-950/20 border border-red-500/30 p-2.5 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> 
              <span>{activeError}</span>
            </div>
          )}

          {/* Action Trigger */}
          <button
            onClick={startListening}
            disabled={listening || loading}
            className="w-full py-2.5 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400 text-cyan-300 font-mono rounded-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed tracking-widest text-sm"
          >
            {listening ? "LISTENING INPUT..." : loading ? "DECRYPTING MATRIX..." : "INITIALIZE VOICE CHECK"}
          </button>
        </div>

        {/* RIGHT COLUMN: The Eye-Grazing Futuristic Cyber-Grid Animation */}
        <div className="flex-1 hidden md:flex flex-col items-center justify-center relative overflow-hidden bg-black/40 border border-cyan-500/20 rounded-xl min-h-[350px]">
          {/* Cyber Grid background layout */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          {/* Cybernetic glowing design accents */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />

          {/* Operational biometric graphic nodes */}
          <div className="relative flex flex-col items-center text-center space-y-4 p-6 z-10">
            <div className={`p-4 rounded-xl border border-cyan-500/30 bg-black/60 shadow-[0_0_20px_rgba(0,242,255,0.1)] transition-transform duration-700 ${listening ? "scale-110 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]" : ""}`}>
              <ShieldCheck className={`w-12 h-12 stroke-[1.25] transition-colors duration-500 ${listening ? "text-purple-400" : "text-cyan-400 animate-pulse"}`} />
            </div>
            <div className="space-y-1 font-mono">
              <div className="text-xs text-cyan-400 tracking-widest uppercase">Biometric_Node_Active</div>
              <div className="text-[10px] text-gray-500">SECURE_CHANNEL_v4.0.0</div>
            </div>
            
            {/* Live streaming dummy terminal bars */}
            <div className="flex items-end justify-center gap-1 w-32 h-6 pt-2">
              <div className={`w-1 bg-cyan-500/40 rounded-t transition-all duration-300 ${listening ? "h-5 bg-purple-500" : "h-2 animate-bounce"}`} style={{ animationDelay: "0.1s" }} />
              <div className={`w-1 bg-cyan-500/40 rounded-t transition-all duration-300 ${listening ? "h-3 bg-purple-400" : "h-4 animate-bounce"}`} style={{ animationDelay: "0.3s" }} />
              <div className={`w-1 bg-cyan-500/40 rounded-t transition-all duration-300 ${listening ? "h-6 bg-purple-500" : "h-1 animate-bounce"}`} style={{ animationDelay: "0.5s" }} />
              <div className={`w-1 bg-cyan-500/40 rounded-t transition-all duration-300 ${listening ? "h-2 bg-purple-400" : "h-3 animate-bounce"}`} style={{ animationDelay: "0.2s" }} />
              <div className={`w-1 bg-cyan-500/40 rounded-t transition-all duration-300 ${listening ? "h-4 bg-purple-500" : "h-2 animate-bounce"}`} style={{ animationDelay: "0.4s" }} />
            </div>
          </div>

          {/* Technical Corner Decals */}
          <div className="absolute top-3 left-3 text-[9px] font-mono text-cyan-500/40 tracking-wider">SYS_GATE.EXE</div>
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-purple-500/40 tracking-wider">AUTH_PHASE_02</div>
        </div>

      </div>
    </div>
  );
}