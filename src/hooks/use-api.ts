import { useCallback, useState } from "react";
export function useApi<T, A extends unknown[]>(fn: (...a: A) => Promise<T>) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState<string | null>(null),
    [isLoading, setIsLoading] = useState(false),
    execute = useCallback(
      async (...a: A) => {
        setIsLoading(true);
        setError(null);
        try {
          const r = await fn(...a);
          setData(r);
          return r;
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unexpected error");
          throw e;
        } finally {
          setIsLoading(false);
        }
      },
      [fn],
    );
  return { data, error, isLoading, execute, setData };
}
