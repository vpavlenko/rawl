import { useEffect, useState } from "react";
import { loadVersionRankings, VersionRankings } from "./versionRanking";

export function useVersionRankings(enabled = true) {
  const [rankings, setRankings] = useState<VersionRankings | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setUnavailable(false);
    loadVersionRankings().then(
      (data) => {
        if (active) setRankings(data);
      },
      () => {
        if (active) setUnavailable(true);
      },
    );
    return () => {
      active = false;
    };
  }, [enabled]);
  return { rankings, unavailable };
}
