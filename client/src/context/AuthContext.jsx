import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("plantery_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(r => setUser(r.data.user))
      .catch(() => localStorage.removeItem("plantery_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("plantery_token", data.token);
    setUser(data.user);
  }
  async function register(fullName, email, password) {
    const { data } = await api.post("/auth/register", { fullName, email, password });
    localStorage.setItem("plantery_token", data.token);
    setUser(data.user);
  }
  function signOut() {
    localStorage.removeItem("plantery_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, register, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
