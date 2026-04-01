"use client";

import { useEffect, useState } from "react";

type SWROptions = {
  dedupingInterval?: number;
  revalidateOnFocus?: boolean;
};

type SWRState<T> = {
  data?: T;
  error?: Error;
  isLoading: boolean;
};

const cache = new Map<string, { ts: number; value: unknown }>();

export function useSWRLite<T>(
  key: string,
  fetcher: (key: string) => Promise<T>,
  options: SWROptions = {},
): SWRState<T> {
  const { dedupingInterval = 0, revalidateOnFocus = true } = options;
  const cached = cache.get(key);

  const [data, setData] = useState<T | undefined>(cached?.value as T | undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    let active = true;

    const load = async (force = false) => {
      const current = cache.get(key);
      const fresh = current && Date.now() - current.ts < dedupingInterval;
      if (!force && fresh) {
        setData(current.value as T);
        setIsLoading(false);
        return;
      }

      setIsLoading(!current);
      try {
        const next = await fetcher(key);
        if (!active) return;
        cache.set(key, { ts: Date.now(), value: next });
        setData(next);
        setError(undefined);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();

    if (revalidateOnFocus) {
      const onFocus = () => {
        void load(true);
      };
      window.addEventListener("focus", onFocus);
      return () => {
        active = false;
        window.removeEventListener("focus", onFocus);
      };
    }

    return () => {
      active = false;
    };
  }, [dedupingInterval, fetcher, key, revalidateOnFocus]);

  return { data, error, isLoading };
}
