import { useState, useCallback } from "react";

export default function useApi<TParams extends any[], TData>(fn: (...args: TParams) => Promise<TData>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<TData | null>(null);

  const execute = useCallback(async (...args: TParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      setData(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { loading, error, data, execute } as const;
}
