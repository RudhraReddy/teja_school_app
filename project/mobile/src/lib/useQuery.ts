import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { request } from "./api";

interface State<T> {
  key: string | null; // `${path}#${nonce}` of the last finished request
  data: T | null;
  error: string | null;
}

/** Loads a GET endpoint, reloads when the screen regains focus, and supports pull-to-refresh. */
export function useQuery<T>(path: string) {
  const [nonce, setNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });
  const key = `${path}#${nonce}`;

  useEffect(() => {
    let cancelled = false;
    request<T>(path)
      .then(
        (data) => !cancelled && setState({ key, data, error: null }),
        (e: unknown) => !cancelled && setState((s) => ({ key, data: s.data, error: e instanceof Error ? e.message : "Something went wrong" })),
      )
      .finally(() => !cancelled && setRefreshing(false));
    return () => {
      cancelled = true;
    };
  }, [path, key]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setNonce((n) => n + 1);
  }, []);

  // Silent reload when returning to the screen (e.g. after posting a notice).
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (seen.current) setNonce((n) => n + 1);
      seen.current = true;
    }, []),
  );

  return { data: state.data, error: state.error, loading: state.key !== key && !refreshing, refreshing, refresh };
}
