import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function useApiData(path) {
  const [state, setState] = useState({ data: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.get(path);
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: [], loading: false, error: error.message ?? "Request failed" });
        }
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [path, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
  return { ...state, refetch };
}
