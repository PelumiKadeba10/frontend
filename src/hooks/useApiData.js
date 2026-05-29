import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function useApiData(path) {
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setState((p) => ({ ...p, loading: true, error: null }));

      try {
        const res = await api.get(path);
        const payload = res?.data;

        if (payload?.success === false) {
          throw new Error(payload.message || "Request failed");
        }

        const normalized =
          Array.isArray(payload?.data) ? payload.data :
          Array.isArray(payload?.sessions) ? payload.sessions :
          Array.isArray(payload?.students) ? payload.students :
          Array.isArray(payload?.attendance) ? payload.attendance :
          Array.isArray(payload) ? payload :
          [];

        if (!cancelled) {
          setState({
            data: normalized,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: [],
            loading: false,
            error: err.message || "Request failed",
          });
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [path, reloadKey]);

  const refetch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, refetch };
}
