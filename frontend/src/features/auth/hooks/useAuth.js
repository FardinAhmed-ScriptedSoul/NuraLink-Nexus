import { useAuth } from "../../../context/AuthContext";
import { loginRequest, loginVerify, registerRequest, registerVerify, logout, logoutAll } from "../../../api/auth";
import { useState } from "react";
import { useNavigate } from "react-router";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginRequest({ email, password });
      sessionStorage.setItem("voiceChallengeId", data.challengeId);
      navigate("/voice-challenge");
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { login, loading, error };
};

export const useVerifyVoice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const verify = async (challengeId, voiceTranscript) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginVerify({ challengeId, voiceTranscript });
      setUser(data.user);
      navigate("/dashboard");
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Voice verification failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { verify, loading, error };
};

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await registerRequest(formData);
      sessionStorage.setItem("registerEmail", formData.email);
      navigate("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { register, loading, error };
};

export const useVerifyOtp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const verifyOtp = async (email, token) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerVerify({ email, token });
      setUser(data.user);
      navigate("/dashboard");
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { verifyOtp, loading, error };
};

export const useLogout = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const logout = async (allDevices = false) => {
    if (allDevices) {
      await logoutAll();
    } else {
      await logout();
    }
    logoutUser();
    navigate("/login");
  };
  return { logout };
};