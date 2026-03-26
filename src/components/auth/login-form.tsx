"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn("credentials", {
        email,
        redirectTo: "/screenings",
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em", color: "#1c1917" }}>
          Welcome to Movie Club
        </h1>
        <p className="text-sm" style={{ lineHeight: 1.6, color: "#78716c" }}>
          Enter your email to find your movie crew.
          <br />
          No password needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ height: 48, fontSize: 16 }}
          />
        </div>
        {error && (
          <p className="text-sm" style={{ color: "#dc2626" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl text-base font-semibold transition-all"
          style={{
            height: 48,
            backgroundColor: "#f59e0b",
            color: "#451a03",
            boxShadow: "0 8px 20px -5px rgba(245,158,11,0.25)",
            opacity: loading ? 0.5 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Finding your crew..." : "Continue"}
        </button>
      </form>

      <p className="text-center text-xs" style={{ color: "#a8a29e" }}>
        By continuing, you agree to be a decent human at the movies.
      </p>
    </div>
  );
}
