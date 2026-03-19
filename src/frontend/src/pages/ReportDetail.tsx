import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  MinusCircle,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { CHECKLIST_SECTIONS, MONTH_NAMES } from "../data/checklistData";
import {
  Variant_NA_Fail_Pass_Unchecked,
  useGetReport,
} from "../hooks/useQueries";

// Normalize status: handles both string enum values and Candid variant objects
// e.g. "Pass" or { Pass: null } both become Variant_NA_Fail_Pass_Unchecked.Pass
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
  const passCount = report.items.filter(
    (i) => normalizeStatus(i.status) === Variant_NA_Fail_Pass_Unchecked.Pass,
  ).length;
  const failCount = report.items.filter(
    (i) => normalizeStatus(i.status) === Variant_NA_Fail_Pass_Unchecked.Fail,
  ).length;
  const naCount = report.items.filter(
    (i) => normalizeStatus(i.status) === Variant_NA_Fail_Pass_Unchecked.NA,
  ).length;

  const getItemStatus = (itemId: string) =>
    normalizeStatus(report.items.find((i) => i.id === itemId)?.status);
  const getItemComment = (itemId: string) =>
    report.items.find((i) => i.id === itemId)?.comment ?? "";

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

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <div className="px-5 py-3 text-center">
              <p className="text-xl font-bold text-success">{passCount}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-xl font-bold text-destructive">{failCount}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-xl font-bold text-muted-foreground">
                {naCount}
              </p>
              <p className="text-xs text-muted-foreground">N/A</p>
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
                      const comment = getItemComment(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 px-5 py-2.5"
                        >
                          <StatusIcon status={status} />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              {item.task}
                            </p>
                            {comment && (
                              <p className="text-xs text-muted-foreground mt-0.5 italic">
                                {comment}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={status} />
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

function StatusIcon({ status }: { status: Variant_NA_Fail_Pass_Unchecked }) {
  if (status === Variant_NA_Fail_Pass_Unchecked.Pass)
    return (
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
    );
  if (status === Variant_NA_Fail_Pass_Unchecked.Fail)
    return (
      <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
    );
  if (status === Variant_NA_Fail_Pass_Unchecked.NA)
    return (
      <MinusCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
    );
  return (
    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
  );
}

function StatusBadge({ status }: { status: Variant_NA_Fail_Pass_Unchecked }) {
  if (status === Variant_NA_Fail_Pass_Unchecked.Pass)
    return (
      <Badge
        className="bg-success/15 text-success border-success/30 text-xs"
        variant="outline"
      >
        Pass
      </Badge>
    );
  if (status === Variant_NA_Fail_Pass_Unchecked.Fail)
    return (
      <Badge
        className="bg-destructive/15 text-destructive border-destructive/30 text-xs"
        variant="outline"
      >
        Fail
      </Badge>
    );
  if (status === Variant_NA_Fail_Pass_Unchecked.NA)
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        N/A
      </Badge>
    );
  return null;
}
