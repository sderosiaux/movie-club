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
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Welcome to Movie Club</h1>
        <p className="text-sm text-stone-500 leading-relaxed">
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
            className="h-12 text-base"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-amber-500 text-base font-semibold text-amber-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Finding your crew..." : "Continue"}
        </button>
      </form>

      <p className="text-center text-xs text-stone-400">
        By continuing, you agree to be a decent human at the movies.
      </p>
    </div>
  );
}
