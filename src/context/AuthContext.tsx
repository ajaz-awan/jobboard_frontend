"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import apiFetch, {
  bootstrapSession,
  clearSession,
  json,
  setAccessToken,
  settleSessionOperations,
  AuthResponse,
} from "@/lib/api";
import { User, Role } from "@/types";
interface Auth {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: Exclude<Role, "admin">,
    company_name?: string,
  ) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}
const Context = createContext<Auth | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Remove credentials left by the previous frontend; never read or reuse them.
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    let live = true;
    const end = () => setUser(null);
    const update = (e: Event) => setUser((e as CustomEvent<User>).detail);
    window.addEventListener("session-ended", end);
    window.addEventListener("session-user", update);
    bootstrapSession()
      .then((d) => {
        if (live) setUser(d.user);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
      window.removeEventListener("session-ended", end);
      window.removeEventListener("session-user", update);
    };
  }, []);
  async function login(email: string, password: string) {
    await settleSessionOperations();
    const d = await apiFetch<AuthResponse>(
      "/api/auth/login",
      json("POST", { email, password }),
    );
    setAccessToken(d.token);
    setUser(d.user);
  }
  async function register(
    name: string,
    email: string,
    password: string,
    role: Exclude<Role, "admin">,
    company_name?: string,
  ) {
    await settleSessionOperations();
    const d = await apiFetch<{ success: boolean; verification_required: boolean; email: string }>(
      "/api/auth/register",
      json("POST", {
        name,
        email,
        password,
        role,
        ...(role === "employer" ? { company_name } : {}),
      }),
    );
    return d.email;
  }
  async function logout() {
    await settleSessionOperations();
    await apiFetch("/api/auth/logout", json("POST"));
    clearSession();
    setUser(null);
  }
  return (
    <Context.Provider
      value={{ user, loading, login, register, logout, updateUser: setUser }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error("AuthProvider is required");
  return context;
}
