"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled error caught by error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display font-bold text-2xl text-ink mb-2">Something went wrong</h1>
        <p className="text-muted mb-6">
          That's an error on our end, not something you did. Try again, or come back in a moment.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
