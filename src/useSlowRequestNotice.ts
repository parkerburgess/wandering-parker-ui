"use client";

import { useEffect, useState } from "react";

// Without this, a slow request just looks frozen — these thresholds turn
// silence into a reassuring message instead. Add entries to escalate further.
const MESSAGES: { afterMs: number; text: string }[] = [
  { afterMs: 2500, text: "Still working — hang tight." },
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
