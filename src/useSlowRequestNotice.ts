"use client";

import { useEffect, useState } from "react";

// Free-tier serverless databases can take up to ~60s to wake from an
// auto-pause. Without this, a slow request just looks frozen — these
// thresholds turn silence into a reassuring, escalating message instead.
const MESSAGES: { afterMs: number; text: string }[] = [
  { afterMs: 2500, text: "Still working — hang tight." },
  {
    afterMs: 15000,
    text: "The database is waking up from being idle. This can take up to a minute — no need to retry.",
  },
];

export function useSlowRequestNotice(isPending: boolean): string | null {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) {
      setMessage(null);
      return;
    }

    const timers = MESSAGES.map(({ afterMs, text }) =>
      setTimeout(() => setMessage(text), afterMs)
    );

    return () => timers.forEach(clearTimeout);
  }, [isPending]);

  return message;
}
