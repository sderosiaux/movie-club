"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const DATE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "tonight", label: "Tonight" },
  { value: "this-week", label: "This Week" },
  { value: "this-weekend", label: "Weekend" },
] as const;

const BOROUGHS = [
  "All",
  "Brooklyn",
  "Manhattan",
  "Queens",
] as const;

type Props = {
  cinemas: { id: string; name: string }[];
};

export function FeedFilters({ cinemas }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDate = searchParams.get("date") ?? "all";
  const currentBorough = searchParams.get("borough") ?? "All";
  const currentCinema = searchParams.get("cinema") ?? "all";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
        {DATE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={currentDate === opt.value ? "secondary" : "ghost"}
            size="xs"
            onClick={() => updateParam("date", opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Borough select */}
      <Select
        value={currentBorough}
        onValueChange={(v) => v && updateParam("borough", v)}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Borough" />
        </SelectTrigger>
        <SelectContent>
          {BOROUGHS.map((b) => (
            <SelectItem key={b} value={b}>
              {b === "All" ? "All boroughs" : b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Cinema select */}
      {cinemas.length > 0 && (
        <Select
          value={currentCinema}
          onValueChange={(v) => v && updateParam("cinema", v)}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Cinema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cinemas</SelectItem>
            {cinemas.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
