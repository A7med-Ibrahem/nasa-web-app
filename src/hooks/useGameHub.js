import { useEffect, useRef } from "react";

import {
  createGameHubConnection,
  joinGameAdminGroup,
  joinGameParticipantGroup,
} from "../realtime/gameHub";

const JOIN_BY_GROUP = {
  admin: joinGameAdminGroup,
  participant: joinGameParticipantGroup,
};

export default function useGameHub(group, events) {
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  });

  useEffect(() => {
    const join = JOIN_BY_GROUP[group];
    if (!join) {
      return undefined;
    }

    let disposed = false;
    const connection = createGameHubConnection();

    const bind = () => {
      Object.entries(eventsRef.current).forEach(([event, handler]) => {
        connection.on(event, (...args) => {
          if (!disposed) {
            handler(...args);
          }
        });
      });
    };

    const start = async () => {
      bind();
      try {
        await connection.start();
        if (disposed) {
          await connection.stop().catch(() => {});
          return;
        }
        await join(connection);
      } catch {
        return undefined;
      }
    };

    const handleReconnected = () => {
      if (!disposed) {
        join(connection).catch(() => {});
      }
    };

    connection.onreconnected(handleReconnected);

    const timer = setTimeout(start, 0);

    return () => {
      disposed = true;
      clearTimeout(timer);
      connection.stop().catch(() => {});
    };
  }, [group]);
}
