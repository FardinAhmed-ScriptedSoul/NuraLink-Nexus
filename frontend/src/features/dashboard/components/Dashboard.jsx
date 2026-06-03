import { useAuth } from "../../../context/AuthContext";
import { logout, logoutAll } from "../../../api/auth";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    logoutUser();
    navigate("/login");
  };

  const handleLogoutAll = async () => {
    await logoutAll();
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-cyber-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-mono text-cyan-400">NEURAL_DASHBOARD</h1>
            <p className="text-gray-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 border border-red-400 text-red-300 rounded">LOGOUT</button>
            <button onClick={handleLogoutAll} className="px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded">LOGOUT_ALL</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-5">Server Integration Array</div>
          <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-5">Sandbox Engine Core</div>
          <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-5">Ecosystem Link</div>
        </div>
      </div>
    </div>
  );
}