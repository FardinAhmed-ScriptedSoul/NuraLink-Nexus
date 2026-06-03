import axios from "axios";

// Get backend URL from environment (default to localhost:5000)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,   // Required for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add a request interceptor for logging or tokens (if needed)
apiClient.interceptors.request.use(
  (config) => {
    // You could attach an Authorization header here if you don't use cookies
    // but we rely on cookies, so nothing extra.
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiry globally (e.g., redirect to login)
    if (error.response?.status === 401) {
      // Optionally clear local state and redirect
      // We'll handle it in AuthContext later
      console.warn("Unauthorized – redirecting to login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;