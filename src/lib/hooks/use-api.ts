"use client";

import { useCallback, useState } from "react";

import type { ApiResponse } from "@/lib/types";

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async (init?: RequestInit) => {
      setLoading(true);
      setError(null);

      try {
        const headers = new Headers(init?.headers);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        const res = await fetch(endpoint, { ...init, headers });
        const body = (await res.json()) as ApiResponse<T>;

        if (!body.success) {
          setError(body.error);
          return null;
        }

        setData(body.data);
        return body.data;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Request failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint],
  );

  return { data, error, loading, request };
}
