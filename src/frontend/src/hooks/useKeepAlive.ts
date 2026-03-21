import { useEffect } from "react";
import { useActor } from "./useActor";

const KEEP_ALIVE_INTERVAL_MS = 20000;

export function useKeepAlive() {
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;

    const interval = setInterval(async () => {
      try {
        await actor.listReports();
      } catch {
        // silently swallow errors
      }
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [actor, isFetching]);
}
