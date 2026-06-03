import { useState, useEffect, useRef } from "react";
import { Cpu } from "lucide-react";

// Generate random cryptographic-like characters
const generateRandomHex = (length = 40) => {
  const chars = "0123456789ABCDEFabcdef!@#$%^&*()_+[]{}|;:,.<>?";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export default function Panel() {
  const [logs, setLogs] = useState([]);
  const [matrixLines, setMatrixLines] = useState([]);
  const containerRef = useRef(null);

  // Simulated slow-drip kernel logs (appear one by one)
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString();
    const logSequence = [
      { text: "INITIALIZING_KERNEL_SCAN...", color: "text-cyan-400/90 font-semibold animate-pulse" },
      { text: ">> CHECKING AI AGENT CORE STABILITY... OK", color: "text-cyan-500/70" },
      { text: ">> ENCRYPTING PACKETS: SHA-512... OK", color: "text-cyan-500/70" },
      { text: ">> ESTABLISHING SECURE HANDSHAKE... [AUTH_PENDING]", color: "text-yellow-500/80" },
      { text: `[${timeStr}] AI_NEURAL_WEIGHTS_LOADED`, color: "text-gray-500" },
      { text: `[${timeStr}] ENCRYPTION_LAYER_8_ACTIVE`, color: "text-green-400/80" },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < logSequence.length) {
        // Ensure we push a valid object
        const nextLog = logSequence[index];
        if (nextLog && nextLog.text && nextLog.color) {
          setLogs((prev) => [...prev, nextLog]);
        }
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Continuous cryptographic signature stream from top
  useEffect(() => {
    const generateLine = () => ({
      id: Date.now() + Math.random(),
      text: generateRandomHex(60),
      opacity: 0.2 + Math.random() * 0.5,
    });

    setMatrixLines(Array.from({ length: 8 }, generateLine));

    const interval = setInterval(() => {
      setMatrixLines((prev) => {
        const newLine = generateLine();
        const updated = [newLine, ...prev];
        if (updated.length > 15) updated.pop();
        return updated;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll kernel logs to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-black/20 border border-cyan-500/10 rounded-xl relative overflow-hidden group min-h-[460px]">
      {/* Background Cyber-Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff05_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none" />

      {/* Dynamic Terminal Feed */}
      <div className="space-y-3 text-xs tracking-wider font-mono relative z-10 text-left flex-1 overflow-y-auto max-h-[280px]" ref={containerRef}>
        <div className="text-cyan-400 font-bold text-sm mb-4 border-b border-cyan-500/20 pb-2 flex items-center gap-2 sticky top-0 bg-black/80 backdrop-blur z-20">
          <Cpu className="w-4 h-4" /> SEC-08 // HUD-V2 // ROOT_ACCESS
        </div>
        {logs.map((log, idx) => (
          // Safe check: only render if log exists
          log && log.color ? (
            <p key={idx} className={log.color}>
              {log.text}
            </p>
          ) : null
        ))}
      </div>

      {/* Cryptographic Signature Matrix */}
      <div className="mt-4 relative z-10">
        <div className="text-cyan-500/40 text-[10px] tracking-wide mb-1 font-mono border-l-2 border-cyan-500/30 pl-2">CRYPTOGRAPHIC_SIGNATURE_STREAM</div>
        <div className="bg-black/60 rounded-md p-3 font-mono text-[10px] leading-relaxed h-[120px] overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
          {matrixLines.map((line) => (
            <div
              key={line.id}
              className="whitespace-nowrap overflow-x-hidden text-cyan-500/80 transition-all duration-300 animate-slideDown"
              style={{ opacity: line.opacity }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>

      {/* Biometric Footer */}
      <div className="border border-cyan-500/20 bg-black/40 rounded-xl p-4 flex justify-between items-center relative z-10 shadow-[0_0_15px_rgba(0,242,255,0.05)] mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-gray-500 tracking-widest">BIO_SCAN_STATUS</p>
            <p className="text-xs text-green-400 font-bold tracking-wider">READY_FOR_VOICE_SYNC</p>
          </div>
        </div>
        <div className="text-right font-mono">
          <p className="text-[10px] text-gray-500 tracking-widest">THREAT_LEVEL</p>
          <p className="text-xs text-red-400 font-bold tracking-widest">MINIMAL_0.02%</p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}