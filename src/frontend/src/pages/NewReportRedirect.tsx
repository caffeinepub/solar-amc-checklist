import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreateReport } from "../hooks/useQueries";

const TIMEOUT_MS = 60000;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;
const WARM_UP_TIMEOUT_MS = 5000;

export default function NewReportRedirect() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const createReport = useCreateReport();
  const started = useRef(false);
  const timedOut = useRef(false);
  const [statusMsg, setStatusMsg] = useState("Connecting to server...");

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    const globalTimeout = setTimeout(() => {
      if (started.current) return;
      timedOut.current = true;
      toast.error("Could not reach the server. Please try again.");
      navigate({ to: "/" });
    }, TIMEOUT_MS);
    return () => clearTimeout(globalTimeout);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once when actor ready
  useEffect(() => {
    if (!actor || isFetching || started.current || timedOut.current) return;
    started.current = true;
    setStatusMsg("Warming up server...");

    const now = new Date();
    const params = { month: now.getMonth() + 1, year: now.getFullYear() };

    async function attemptCreate(attemptsLeft: number): Promise<void> {
      if (timedOut.current) return;
      try {
        const reportId = await createReport.mutateAsync(params);
        if (!timedOut.current) {
          navigate({ to: `/checklist/${reportId}` });
        }
      } catch {
        if (timedOut.current) return;
        if (attemptsLeft > 1) {
          const attempt = MAX_RETRIES - attemptsLeft + 2;
          setStatusMsg(`Retrying... (attempt ${attempt} of ${MAX_RETRIES})`);
          await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
          return attemptCreate(attemptsLeft - 1);
        }
        toast.error(
          "Could not create report. Please check your connection and try again.",
        );
        navigate({ to: "/" });
      }
    }

    async function warmUpAndCreate() {
      // Ping the canister first to wake it up, then create the report
      try {
        const warmUpPromise = actor!.listReports();
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(
            () => reject(new Error("warm-up timeout")),
            WARM_UP_TIMEOUT_MS,
          ),
        );
        await Promise.race([warmUpPromise, timeoutPromise]);
      } catch {
        // ignore warm-up errors, proceed anyway
      }
      if (timedOut.current) return;
      setStatusMsg("Creating new report...");
      await attemptCreate(MAX_RETRIES);
    }

    warmUpAndCreate();
  }, [actor, isFetching]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{statusMsg}</p>
      <p className="text-xs text-muted-foreground/60">
        This may take up to 30 seconds on first load
      </p>
    </div>
  );
}
