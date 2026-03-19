import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  FilePlus,
  FileText,
  Sun,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { MONTH_NAMES } from "../data/checklistData";
import { useCreateReport, useListReports } from "../hooks/useQueries";

export default function Dashboard() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthName = MONTH_NAMES[currentMonth - 1];

  const navigate = useNavigate();
  const { data: reports, isLoading } = useListReports();
  const createReport = useCreateReport();

  const handleNewReport = async () => {
    try {
      const reportId = await createReport.mutateAsync({
        month: currentMonth,
        year: currentYear,
      });
      navigate({ to: `/checklist/${reportId}` });
    } catch {
      toast.error("Failed to create report. Please try again.");
    }
  };

  const recentReports =
    reports
      ?.slice()
      .sort((a, b) => Number(b.createdAt - a.createdAt))
      .slice(0, 5) ?? [];
  const submittedCount = reports?.filter((r) => r.submitted).length ?? 0;
  const draftCount = reports?.filter((r) => !r.submitted).length ?? 0;

  const handleReportClick = (report: { id: string; submitted: boolean }) => {
    navigate({
      to: report.submitted
        ? `/reports/${report.id}`
        : `/checklist/${report.id}`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Sun className="w-4 h-4" />
            <span>Solar AMC Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {monthName} {currentYear}
          </h1>
          <p className="text-muted-foreground mt-1">
            Current maintenance period
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleNewReport}
          disabled={createReport.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-card"
          data-ocid="dashboard.new_report.primary_button"
        >
          <FilePlus className="w-5 h-5" />
          {createReport.isPending ? "Creating..." : "Start New Report"}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="shadow-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-foreground">
                  {reports?.length ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold text-success">
                  {submittedCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-warning">{draftCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div
                className="space-y-3"
                data-ocid="dashboard.reports.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="dashboard.reports.empty_state"
              >
                <Sun className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No reports yet</p>
                <p className="text-sm mt-1">
                  Start your first monthly report above
                </p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="dashboard.reports.list">
                {recentReports.map((report, idx) => (
                  <button
                    key={report.id}
                    type="button"
                    data-ocid={`dashboard.report.item.${idx + 1}`}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors text-left"
                    onClick={() => handleReportClick(report)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {MONTH_NAMES[Number(report.month) - 1]}{" "}
                          {String(report.year)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.clientName || "No client name"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        report.submitted
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-warning/15 text-warning-foreground border-warning/30"
                      }
                      variant="outline"
                    >
                      {report.submitted ? "Submitted" : "Draft"}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
