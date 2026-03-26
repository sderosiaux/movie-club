"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    photoUrl: string | null;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (data) setUser(data);
    }
    load();
  }, []);

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/screenings"
          className="text-lg font-bold tracking-tight text-stone-900"
        >
          <span className="text-amber-600">Movie</span> Club
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none ring-ring focus-visible:ring-2">
            <Avatar className="h-8 w-8">
              {user?.photoUrl && <AvatarImage src={user.photoUrl} alt={user.name} />}
              <AvatarFallback className="text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => router.push(`/profile/${user?.id ?? ""}`)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
