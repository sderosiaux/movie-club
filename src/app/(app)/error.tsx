"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
        Try again
      </button>
    </main>
  );
}
