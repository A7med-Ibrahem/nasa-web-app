import { useCallback, useEffect, useState } from "react";

import { searchTeams } from "../api/teams";
import { staffData } from "../data/staffData";
import { loadError } from "../utils/staffErrors";

/**
 * Loads the full team list once for staff filter selects.
 *
 * `request()` attaches the stored staff token, so `username` comes back from
 * the endpoint that only populates it for staff callers. A failure is exposed
 * to the page instead of being replaced with an empty list, and `retry` starts
 * a fresh request without changing the selected filters.
 */
export default function useTeamOptions() {
  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    searchTeams("", { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setTeams(Array.isArray(result) ? result : []);
        setStatus("ready");
        setError("");
      })
      .catch((cause) => {
        if (controller.signal.aborted || cause?.name === "AbortError") {
          return;
        }
        setTeams([]);
        setStatus("error");
        setError(loadError(cause, staffData.common.teamsError));
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setError("");
    setAttempt((current) => current + 1);
  }, []);

  return { teams, status, error, retry };
}
