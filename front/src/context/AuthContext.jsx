import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { firstName, lastName, email }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, check if token exists and decode user info
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT payload (no verification needed on frontend)
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check token not expired
        if (payload.exp * 1000 > Date.now()) {
          // Get user info from localStorage if saved
          const savedUser = localStorage.getItem("userInfo");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser({ id: payload.id, role: payload.role });
          }
        } else {
          // Token expired — clear
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userInfo");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  const login = (token, refreshToken, userInfo) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}