import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic one-resource fetch state.
 *
 * The fetcher receives `{ signal }` and must return a Promise. State changes
 * happen only inside promise callbacks (or the retry handler), never
 * synchronously in the effect body, and a stale response can never overwrite a
 * newer request: every run carries an incrementing id and an AbortController.
 *
 * Returns `{ status, data, error, retry }` where status is one of
 * "idle" (disabled), "loading", "error", "ready".
 */
export default function useApiResource(fetcher, { enabled = true } = {}) {
  const [state, setState] = useState({
    status: enabled ? "loading" : "idle",
    data: null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    let active = true;

    /* Deferred one microtask so the effect body itself never calls setState
       (react-hooks v7) while the loading state still lands before the fetch. */
    Promise.resolve()
      .then(() => {
        if (!active || requestId !== requestIdRef.current) {
          return undefined;
        }

        setState({ status: "loading", data: null, error: null });
        return fetcher({ signal: controller.signal });
      })
      .then((data) => {
        if (!active || requestId !== requestIdRef.current) {
          return;
        }

        setState({ status: "ready", data, error: null });
      })
      .catch((cause) => {
        if (
          !active ||
          requestId !== requestIdRef.current ||
          cause?.name === "AbortError"
        ) {
          return;
        }

        setState({
          status: "error",
          data: null,
          error:
            cause instanceof Error
              ? cause
              : new Error("The request could not be completed."),
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetcher, enabled, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
