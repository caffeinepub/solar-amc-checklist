import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";

const MAX_CREATE_RETRIES = 15;
const RETRY_DELAY_MS = 4000;
const WARMUP_RETRIES = 8;
const WARMUP_RETRY_DELAY_MS = 5000;

export default function NewReportRedirect() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const started = useRef(false);
  const [statusMsg, setStatusMsg] = useState("Connecting to server...");

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const now = new Date();
    const month = BigInt(now.getMonth() + 1);
    const year = BigInt(now.getFullYear());

    async function run() {
      // Get a fresh actor directly -- no reliance on React Query cache
      let actor: Awaited<ReturnType<typeof createActorWithConfig>>;
      try {
        setStatusMsg("Initializing connection...");
        actor = await createActorWithConfig();
      } catch (err) {
        console.error("Failed to create actor:", err);
        toast.error("Could not connect. Please refresh and try again.");
        navigateRef.current({ to: "/" });
        return;
      }

      // Warm-up: ping backend until it responds
      setStatusMsg("Waking up server (may take up to 30 seconds)...");
      let warmedUp = false;
      for (let i = 0; i < WARMUP_RETRIES; i++) {
        try {
          await Promise.race([
            actor.listReports(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), 8000),
            ),
          ]);
          warmedUp = true;
          break;
        } catch {
          if (i < WARMUP_RETRIES - 1) {
            setStatusMsg(
              `Server is starting up... (${i + 1}/${WARMUP_RETRIES})`,
            );
            await new Promise((res) => setTimeout(res, WARMUP_RETRY_DELAY_MS));
          }
        }
      }

      if (warmedUp) {
        setStatusMsg("Server is ready. Creating report...");
      } else {
        setStatusMsg("Attempting to create report...");
      }

      // Create report with retries
      for (let attempt = 1; attempt <= MAX_CREATE_RETRIES; attempt++) {
        try {
          if (attempt > 1) {
            setStatusMsg(
              `Retrying... (attempt ${attempt} of ${MAX_CREATE_RETRIES})`,
            );
          }
          const reportId = await Promise.race([
            actor.createReport(month, year),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("create timeout")), 30000),
            ),
          ]);
          navigateRef.current({ to: `/checklist/${reportId}` });
          return;
        } catch (err) {
          console.error(`Create attempt ${attempt} failed:`, err);
          if (attempt < MAX_CREATE_RETRIES) {
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
          }
        }
      }

      toast.error(
        "Could not create report after multiple attempts. Please try again.",
      );
      navigateRef.current({ to: "/" });
    }

    run();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-center px-4">{statusMsg}</p>
      <p className="text-xs text-muted-foreground/60 text-center px-4">
        The server sometimes takes 20-30 seconds to wake up after idle time
      </p>
    </div>
  );
}
