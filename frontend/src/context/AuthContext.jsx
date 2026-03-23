import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "menswear-auth";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));

  const persistAuth = (nextAuth) => {
    setAuth(nextAuth);
    if (nextAuth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const fetchMe = async (tokenOverride) => {
    const token = tokenOverride || auth?.token;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (tokenOverride && stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, token }));
      }
      const { data } = await client.get("/auth/me");
      setUser(data);
    } catch {
      persistAuth(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [auth?.token]);

  const login = async (payload) => {
    const { data } = await client.post("/auth/login", payload);
    persistAuth(data);
    await fetchMe(data.token);
    return data;
  };

  const register = async (payload) => {
    const { data } = await client.post("/auth/register", payload);
    persistAuth(data);
    await fetchMe(data.token);
    return data;
  };

  const logout = () => {
    persistAuth(null);
    setUser(null);
  };

  const refreshUser = fetchMe;

  return (
    <AuthContext.Provider
      value={{ auth, user, loading, login, register, logout, refreshUser, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
