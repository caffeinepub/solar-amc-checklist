import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function NewReportRedirect() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const qc = useQueryClient();
  const started = useRef(false);

  if (actor && !started.current) {
    started.current = true;
    const now = new Date();
    actor
      .createReport(BigInt(now.getMonth() + 1), BigInt(now.getFullYear()))
      .then((reportId: string) => {
        qc.invalidateQueries({ queryKey: ["reports"] });
        navigate({ to: `/checklist/${reportId}` });
      })
      .catch(() => {
        toast.error("Failed to create report.");
        navigate({ to: "/" });
      });
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Creating new report...</p>
    </div>
  );
}
