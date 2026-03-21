import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { MONTH_NAMES } from "../data/checklistData";
import { useGetReport } from "../hooks/useQueries";

export default function ReportDetail() {
  const { reportId } = useParams({ from: "/reports/$reportId" });
  const navigate = useNavigate();
  const { data: report, isLoading } = useGetReport(reportId);

  const reportName = localStorage.getItem(`reportName:${reportId}`) || "";

  const photos: string[] = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`reportPhotos:${reportId}`) || "[]",
      );
    } catch {
      return [];
    }
  })();

  if (isLoading || !report) {
    return (
      <div
        className="max-w-3xl mx-auto space-y-4"
        data-ocid="report_detail.loading_state"
      >
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const monthName = MONTH_NAMES[Number(report.month) - 1];

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-5">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground mb-3 -ml-2"
            onClick={() => navigate({ to: "/reports" })}
            data-ocid="report_detail.back.button"
          >
            <ArrowLeft className="w-4 h-4" />
            All Reports
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {reportName || `${monthName} ${String(report.year)} Report`}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {report.clientName || "No client name"}
              </p>
            </div>
            <Badge
              className={
                report.submitted
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-warning/15 text-warning-foreground border-warning/30"
              }
              variant="outline"
            >
              {report.submitted ? "✓ Submitted" : "Draft"}
            </Badge>
          </div>
        </div>

        {/* Report Card */}
        <div
          className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
          data-ocid="report_detail.report.card"
        >
          {/* Header */}
          <div className="bg-primary px-6 py-5 text-white">
            <h2 className="font-bold text-base">
              Monthly Solar Maintenance Report
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-white/60">Period: </span>
                <span className="font-medium">
                  {monthName} {String(report.year)}
                </span>
              </div>
              <div>
                <span className="text-white/60">Client: </span>
                <span className="font-medium">{report.clientName || "—"}</span>
              </div>
              <div>
                <span className="text-white/60">System ID: </span>
                <span className="font-medium">{report.systemId || "—"}</span>
              </div>
              <div>
                <span className="text-white/60">Inspected By: </span>
                <span className="font-medium">{report.inspectedBy || "—"}</span>
              </div>
              <div>
                <span className="text-white/60">Date: </span>
                <span className="font-medium">{report.date || "—"}</span>
              </div>
              <div>
                <span className="text-white/60">Solar Generation: </span>
                <span className="font-medium">
                  {report.solarGenerationUnits || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Recommendations */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Notes &amp; Recommendations
            </p>
            {report.notes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {report.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No notes or recommendations recorded.
              </p>
            )}
          </div>

          {/* Photo Attachments */}
          {photos.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Attachments ({photos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, idx) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: photos are order-dependent
                    key={idx}
                    className="rounded-md overflow-hidden border border-border"
                    style={{ aspectRatio: "1" }}
                  >
                    <img
                      src={src}
                      alt={`Attachment ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
