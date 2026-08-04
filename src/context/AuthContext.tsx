// src/context/AuthContext.tsx
"use client"; // yeh line zaroori hai — batati hai Next.js ko ki yeh Client Component hai (browser mein chalega)

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import apiFetch from "@/lib/api";
import { User } from "@/types";

// backend "POST /api/auth/login" ka response shape


 interface AuthResponse {
  success: boolean; // backend "success: true" bhejta hai
  message: string;  // backend "Account ban gaya ✅" jaisa message bhejta hai
  user: User;
  token: string;
}


// Context mein kya-kya cheezein available hongi, uska type
interface AuthContextType {
  user: User | null; // abhi login hai to User object, warna null
  token: string | null;
  loading: boolean; // O(1) — initial load ke waqt localStorage check ho raha hai ya nahi
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "candidate" | "employer"
  ) => Promise<void>;
  logout: () => void;
}

// Context banaya — default undefined, kyunki bina Provider ke isay use nahi karna chahiye
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component — yeh poori app ko wrap karega (layout.tsx mein)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // O(1) — state initialize
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // O(1) — shuru mein true, jab tak localStorage check na ho

  // Component mount hote hi (page refresh pe bhi) localStorage se purana login state restore karna
  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // O(1)
    const storedUser = localStorage.getItem("user"); // O(1)

    if (storedToken && storedUser) {
      setToken(storedToken); // O(1)
      setUser(JSON.parse(storedUser)); // O(n) — n = stored JSON string ki length, parsing ke liye
    }
    setLoading(false); // O(1) — check complete, ab UI render ho sakta hai
  }, []); // empty array — sirf ek baar chale, jab component pehli dafa mount ho

  // LOGIN function — backend "POST /api/auth/login" ko call karta hai
  async function login(email: string, password: string) {
    const data = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }), // O(1) — chota object hai, stringify fast hai
    });

    // success mile to token + user save karo — state mein bhi, localStorage mein bhi
    localStorage.setItem("token", data.token); // O(1)
    localStorage.setItem("user", JSON.stringify(data.user)); // O(n) — n = user object size
    setToken(data.token);
    setUser(data.user);
  }

  // REGISTER function — backend "POST /api/auth/register" ko call karta hai
  async function register(
    name: string,
    email: string,
    password: string,
    role: "candidate" | "employer"
  ) {
    const data = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  // LOGOUT — koi backend call nahi chahiye (JWT stateless hai, server pe kuch delete nahi karna)
  function logout() {
    localStorage.removeItem("token"); // O(1)
    localStorage.removeItem("user"); // O(1)
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — components isay use karke Context access karenge
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // agar koi component AuthProvider ke bahar isay use kare, to turant pata chal jaye
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}