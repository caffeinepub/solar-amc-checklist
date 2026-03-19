import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Eye, FileText, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MONTH_NAMES } from "../data/checklistData";
import { useDeleteReport, useListReports } from "../hooks/useQueries";

export default function ReportsHistory() {
  const navigate = useNavigate();
  const { data: reports, isLoading } = useListReports();
  const deleteReport = useDeleteReport();

  const sorted =
    reports?.slice().sort((a, b) => {
      const yearDiff = Number(b.year - a.year);
      if (yearDiff !== 0) return yearDiff;
      return Number(b.month - a.month);
    }) ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deleteReport.mutateAsync(id);
      toast.success("Report deleted.");
    } catch {
      toast.error("Failed to delete report.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Reports History
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              All AMC maintenance reports
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/checklist/new" })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            data-ocid="reports.new_report.button"
          >
            + New Report
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3" data-ocid="reports.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="bg-card border border-border rounded-xl p-14 text-center shadow-card"
            data-ocid="reports.empty_state"
          >
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="font-semibold text-foreground">No reports found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              Start a new monthly maintenance report
            </p>
            <Button
              onClick={() => navigate({ to: "/checklist/new" })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="reports.empty.new_report.button"
            >
              Create First Report
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {sorted.length} reports total
              </p>
            </div>
            <div className="divide-y divide-border" data-ocid="reports.list">
              {sorted.map((report, idx) => (
                <motion.div
                  key={report.id}
                  data-ocid={`reports.report.item.${idx + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">
                        {MONTH_NAMES[Number(report.month) - 1]}{" "}
                        {String(report.year)}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          report.submitted
                            ? "bg-success/15 text-success border-success/30 text-xs"
                            : "bg-warning/15 text-warning-foreground border-warning/30 text-xs"
                        }
                      >
                        {report.submitted ? "Submitted" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.clientName || "No client"}
                      {report.systemId ? ` · ${report.systemId}` : ""}
                      {report.inspectedBy ? ` · ${report.inspectedBy}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        navigate({
                          to: report.submitted
                            ? `/reports/${report.id}`
                            : `/checklist/${report.id}`,
                        })
                      }
                      data-ocid={`reports.view.button.${idx + 1}`}
                    >
                      <Eye className="w-4 h-4" />
                      {report.submitted ? "View" : "Continue"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-ocid={`reports.delete.button.${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="reports.delete.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the{" "}
                            {MONTH_NAMES[Number(report.month) - 1]}{" "}
                            {String(report.year)} report for{" "}
                            {report.clientName || "this client"}? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="reports.delete.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={() => handleDelete(report.id)}
                            data-ocid="reports.delete.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
