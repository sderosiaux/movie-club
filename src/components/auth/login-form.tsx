"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
  }

  async function handleOAuth(provider: "google" | "apple") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (sent) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Check your email for the login link.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Join Movie Club</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleMagicLink} className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" className="w-full">Send magic link</Button>
        </form>
        <Separator />
        <Button variant="outline" className="w-full" onClick={() => handleOAuth("google")}>Continue with Google</Button>
        <Button variant="outline" className="w-full" onClick={() => handleOAuth("apple")}>Continue with Apple</Button>
      </CardContent>
    </Card>
  );
}
