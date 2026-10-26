import * as signalR from "@microsoft/signalr";
import { buildHubUrl } from "../api/config";
import { getStoredToken } from "../auth/tokenStorage";

export function createHub(path, { auth = true } = {}) {
  const url = buildHubUrl(path.replace(/^\/+/, ""));
  const builder = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: auth ? () => getStoredToken() || "" : undefined,
      skipNegotiation: false,
      withCredentials: true,
    })
    .withAutomaticReconnect();

  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV) {
    builder.configureLogging(signalR.LogLevel.Warning);
  }

  return builder.build();
}

export { signalR };
