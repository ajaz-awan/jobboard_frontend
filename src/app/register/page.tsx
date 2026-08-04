// src/app/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password, role);
      router.push("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--paper-raised)] border border-[var(--line)] rounded-lg p-8">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)] mb-6 text-center">
          Create your account
        </h1>

        {error && (
          <div className="bg-[var(--danger-bg)] text-[var(--danger)] text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Ali Khan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              I am a
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                  role === "candidate"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--paper-raised)] text-[var(--ink)] border-[var(--line)]"
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole("employer")}
                className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                  role === "employer"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--paper-raised)] text-[var(--ink)] border-[var(--line)]"
                }`}
              >
                Employer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-white py-2 rounded-md font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-[var(--ink-muted)] text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}