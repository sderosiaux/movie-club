"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Users, PlusCircle, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: boolean;
};

const tabs: Tab[] = [
  { label: "Screenings", href: "/screenings", icon: Clapperboard },
  { label: "My Crews", href: "/crews", icon: Users },
  { label: "New", href: "/screenings/new", icon: PlusCircle, accent: true },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/screenings") {
      return pathname === "/screenings" || (pathname.startsWith("/screenings/") && pathname !== "/screenings/new");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-sm safe-bottom">
      <div className="mx-auto grid h-16 max-w-3xl grid-cols-4">
        {tabs.map(({ label, href, icon: Icon, accent }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "transition-colors",
                  accent ? "h-6 w-6" : "h-5 w-5",
                  active && "fill-primary/15",
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
