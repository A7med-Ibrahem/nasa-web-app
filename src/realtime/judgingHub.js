import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

import { buildHubUrl } from "../api/config";

export const STANDINGS_UPDATED_EVENT = "StandingsUpdated";
export const SCORES_SUBMITTED_EVENT = "ScoresSubmitted";

export const JUDGING_HUB_URL = buildHubUrl("/hubs/judging");

export function createJudgingHubConnection() {
  return new HubConnectionBuilder()
    /* The deployed hub allows any origin but does not allow credentials; the
       standings endpoint and hub are public, so cookies are not needed. */
    .withUrl(JUDGING_HUB_URL, { withCredentials: false })
    .withAutomaticReconnect()
    .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error)
    .build();
}
