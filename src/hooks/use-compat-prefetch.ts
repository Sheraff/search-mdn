import { useEffect, useState } from "react";

import { getCompat, readCachedCompat } from "@/lib/compat";
import type { CompatMatch, Result } from "@/types";

type CompatState = Record<string, CompatMatch | null>;

export function useCompatPrefetch(selectedResult: Result | undefined): CompatState {
  const [compatByPath, setCompatByPath] = useState<CompatState>({});

  useEffect(() => {
    if (!selectedResult) {
      return;
    }

    const path = selectedResult.path;
    if (compatByPath[path] !== undefined) {
      return;
    }

    const cached = readCachedCompat(path);
    if (cached !== undefined) {
      setCompatByPath({
        [path]: cached,
      });
      return;
    }

    let cancelled = false;

    const run = async () => {
      const compat = await getCompat(path);

      if (cancelled) {
        return;
      }

      setCompatByPath({
        [path]: compat ?? null,
      });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [compatByPath, selectedResult]);

  return compatByPath;
}
