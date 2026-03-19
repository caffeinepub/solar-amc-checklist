import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { motion } from "motion/react";
import { CHECKLIST_SECTIONS, MONTH_NAMES } from "../data/checklistData";
import {
  Variant_NA_Fail_Pass_Unchecked,
  useGetReport,
} from "../hooks/useQueries";

function normalizeStatus(status: unknown): Variant_NA_Fail_Pass_Unchecked {
  if (typeof status === "string") {
    if (status === "Pass") return Variant_NA_Fail_Pass_Unchecked.Pass;
    if (status === "Fail") return Variant_NA_Fail_Pass_Unchecked.Fail;
    if (status === "NA") return Variant_NA_Fail_Pass_Unchecked.NA;
    return Variant_NA_Fail_Pass_Unchecked.Unchecked;
  }
  if (status && typeof status === "object") {
    if ("Pass" in status) return Variant_NA_Fail_Pass_Unchecked.Pass;
    if ("Fail" in status) return Variant_NA_Fail_Pass_Unchecked.Fail;
    if ("NA" in status) return Variant_NA_Fail_Pass_Unchecked.NA;
  }
  return Variant_NA_Fail_Pass_Unchecked.Unchecked;
}

export default function ReportDetail() {
  const { reportId } = useParams({ from: "/reports/$reportId" });
  const navigate = useNavigate();
  const { data: report, isLoading } = useGetReport(reportId);

  if (isLoading || !report) {
    return (
      <div
        className="max-w-3xl mx-auto space-y-4"
        data-ocid="report_detail.loading_state"
      >
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  const monthName = MONTH_NAMES[Number(report.month) - 1];
  const completedCount = report.items.filter(
    (i) => normalizeStatus(i.status) === Variant_NA_Fail_Pass_Unchecked.Pass,
  ).length;

  const getItemStatus = (itemId: string) =>
    normalizeStatus(report.items.find((i) => i.id === itemId)?.status);

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
                {monthName} {String(report.year)} Report
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

          {/* Single completed stat */}
          <div className="flex items-center justify-center py-4 border-b border-border">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {completedCount}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Items Completed
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="divide-y divide-border">
            {CHECKLIST_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold",
                      section.darkHeader
                        ? "bg-section-dark text-white"
                        : "bg-section-pale text-primary",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {section.title}
                  </div>
                  <div className="divide-y divide-border">
                    {section.items.map((item) => {
                      const status = getItemStatus(item.id);
                      const isPass =
                        status === Variant_NA_Fail_Pass_Unchecked.Pass;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-5 py-2.5"
                        >
                          {isPass ? (
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <p
                            className={cn(
                              "text-sm flex-1",
                              isPass
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {item.task}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="px-5 py-4 border-t border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Notes &amp; Recommendations
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {report.notes}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
