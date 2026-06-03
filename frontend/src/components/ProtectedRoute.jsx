import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-cyan-400">Loading neural uplink...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}