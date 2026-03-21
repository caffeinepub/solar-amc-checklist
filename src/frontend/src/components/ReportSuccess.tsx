import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Circle, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CHECKLIST_SECTIONS, MONTH_NAMES } from "../data/checklistData";
import {
  type Report,
  Variant_NA_Fail_Pass_Unchecked,
} from "../hooks/useQueries";
import { copyToClipboard } from "../lib/clipboard";

interface Props {
  report: Report & {
    clientName: string;
    inspectedBy: string;
    date: string;
    notes: string;
  };
  reportId: string;
}

export default function ReportSuccess({ report, reportId }: Props) {
  const navigate = useNavigate();
  const monthName = MONTH_NAMES[Number(report.month) - 1];
  const reportUrl = `${window.location.origin}/reports/${reportId}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(reportUrl);
    if (success) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.info("Tap and hold to copy the link manually:", {
        description: reportUrl,
        duration: 10000,
      });
    }
  };

  const getItemStatus = (itemId: string) => {
    return (
      report.items.find((i) => i.id === itemId)?.status ??
      Variant_NA_Fail_Pass_Unchecked.Unchecked
    );
  };

  const completedCount = report.items.filter(
    (i) => i.status === Variant_NA_Fail_Pass_Unchecked.Pass,
  ).length;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Success Banner */}
        <div className="bg-success text-white rounded-xl p-6 mb-4 flex items-center gap-4 shadow-card">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              Report Submitted Successfully!
            </h1>
            <p className="text-white/80 text-sm mt-0.5">
              The maintenance report for {monthName} {String(report.year)} has
              been submitted.
            </p>
          </div>
        </div>

        {/* Share link box */}
        <div className="bg-card border border-border rounded-lg px-4 py-3 mb-5 flex items-center gap-3 shadow-xs">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5 font-medium">
              Shareable Report Link
            </p>
            <p className="text-sm text-foreground truncate font-mono">
              {reportUrl}
            </p>
          </div>
          <Button
            size="sm"
            variant={copied ? "default" : "outline"}
            className={cn(
              "gap-1.5 flex-shrink-0",
              copied && "bg-success hover:bg-success text-white border-success",
            )}
            onClick={handleCopy}
            data-ocid="success.copy_link.button"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        {/* Report Card */}
        <div
          className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
          data-ocid="success.report.card"
        >
          {/* Header */}
          <div className="bg-primary px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Monthly Solar Maintenance Report
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  Annual Maintenance Contract (AMC)
                </p>
              </div>
              <Badge
                className="bg-white/20 text-white border-white/30 text-xs"
                variant="outline"
              >
                ✓ Submitted
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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

          {/* Summary stat */}
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

          {/* Checklist sections */}
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

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate({ to: "/" })}
            data-ocid="success.dashboard.button"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/reports" })}
            data-ocid="success.reports.button"
          >
            View All Reports
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
