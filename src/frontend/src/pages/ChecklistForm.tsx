import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  MinusCircle,
  Send,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ReportSuccess from "../components/ReportSuccess";
import {
  CHECKLIST_SECTIONS,
  MONTH_NAMES,
  TOTAL_ITEMS,
} from "../data/checklistData";
import {
  Variant_NA_Fail_Pass_Unchecked,
  useGetReport,
  useSubmitReport,
  useUpdateChecklistItem,
  useUpdateMetadata,
} from "../hooks/useQueries";
import type { Report } from "../hooks/useQueries";

export default function ChecklistForm() {
  const { reportId } = useParams({ from: "/checklist/$reportId" });

  const { data: report, isLoading } = useGetReport(reportId);
  const updateItem = useUpdateChecklistItem(reportId);
  const updateMeta = useUpdateMetadata(reportId);
  const submitReport = useSubmitReport();

  const [submitted, setSubmitted] = useState(false);

  const [meta, setMeta] = useState({
    clientName: "",
    systemId: "",
    inspectedBy: "",
    date: new Date().toISOString().split("T")[0],
    solarGenerationUnits: "",
    solarGenerationPerMonth: "",
    notes: "",
  });

  const metaSeeded = useRef(false);
  useEffect(() => {
    if (report && !metaSeeded.current) {
      metaSeeded.current = true;
      setMeta({
        clientName: report.clientName,
        systemId: report.systemId,
        inspectedBy: report.inspectedBy,
        date: report.date || new Date().toISOString().split("T")[0],
        solarGenerationUnits: report.solarGenerationUnits,
        solarGenerationPerMonth: report.solarGenerationPerMonth,
        notes: report.notes,
      });
    }
  }, [report]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveMeta = useCallback(
    (updatedMeta: typeof meta) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateMeta.mutate(updatedMeta);
      }, 800);
    },
    [updateMeta],
  );

  const handleMetaChange = (field: keyof typeof meta, value: string) => {
    const updated = { ...meta, [field]: value };
    setMeta(updated);
    saveMeta(updated);
  };

  const [localItems, setLocalItems] = useState<
    Record<string, { status: Variant_NA_Fail_Pass_Unchecked; comment: string }>
  >({});

  const itemsSeeded = useRef(false);
  useEffect(() => {
    if (report && !itemsSeeded.current) {
      itemsSeeded.current = true;
      const map: Record<
        string,
        { status: Variant_NA_Fail_Pass_Unchecked; comment: string }
      > = {};
      for (const item of report.items) {
        map[item.id] = { status: item.status, comment: item.comment };
      }
      setLocalItems(map);
    }
  }, [report]);

  const handleStatusChange = (
    itemId: string,
    status: Variant_NA_Fail_Pass_Unchecked,
  ) => {
    const comment = localItems[itemId]?.comment ?? "";
    setLocalItems((prev) => ({ ...prev, [itemId]: { status, comment } }));
    updateItem.mutate({ itemId, status, comment });
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setLocalItems((prev) => ({
      ...prev,
      [itemId]: {
        status:
          prev[itemId]?.status ?? Variant_NA_Fail_Pass_Unchecked.Unchecked,
        comment,
      },
    }));
  };

  const handleCommentBlur = (itemId: string) => {
    const item = localItems[itemId];
    if (!item) return;
    updateItem.mutate({ itemId, status: item.status, comment: item.comment });
  };

  const checkedCount = Object.values(localItems).filter(
    (i) => i.status !== Variant_NA_Fail_Pass_Unchecked.Unchecked,
  ).length;
  const progressPct = Math.round((checkedCount / TOTAL_ITEMS) * 100);

  const isFormComplete =
    checkedCount === TOTAL_ITEMS &&
    meta.clientName.trim() !== "" &&
    meta.inspectedBy.trim() !== "" &&
    meta.date !== "";

  const handleSubmit = async () => {
    if (!isFormComplete) return;
    try {
      await updateMeta.mutateAsync(meta);
      await submitReport.mutateAsync(reportId);
      // Auto-copy the report link to clipboard
      const reportUrl = `${window.location.origin}/reports/${reportId}`;
      try {
        await navigator.clipboard.writeText(reportUrl);
        toast.success("Report submitted! Link copied to clipboard.", {
          description: "Paste and share it via WhatsApp or SMS.",
          duration: 5000,
        });
      } catch {
        toast.success("Report submitted successfully!");
      }
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit report. Please try again.");
    }
  };

  if (submitted && report) {
    const mergedReport: Report = {
      ...report,
      clientName: meta.clientName,
      systemId: meta.systemId,
      inspectedBy: meta.inspectedBy,
      date: meta.date,
      solarGenerationUnits: meta.solarGenerationUnits,
      solarGenerationPerMonth: meta.solarGenerationPerMonth,
      notes: meta.notes,
      items: report.items.map((item) => ({
        ...item,
        ...(localItems[item.id] ?? {}),
      })),
    };
    return <ReportSuccess report={mergedReport} reportId={reportId} />;
  }

  if (isLoading || !report) {
    return (
      <div
        className="max-w-4xl mx-auto space-y-4"
        data-ocid="checklist.loading_state"
      >
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  const monthName = MONTH_NAMES[Number(report.month) - 1];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>AMC Checklist</span>
            <ChevronRight className="w-3 h-3" />
            <span>
              {monthName} {String(report.year)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Monthly Solar Maintenance Checklist
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {monthName} {String(report.year)} — Annual Maintenance Contract
          </p>
        </div>

        {/* Progress Strip */}
        <div className="bg-card border border-border rounded-lg px-5 py-4 mb-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {checkedCount} of {TOTAL_ITEMS} items completed
            </span>
            <span className="text-sm font-semibold text-primary">
              {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              {
                Object.values(localItems).filter(
                  (i) => i.status === Variant_NA_Fail_Pass_Unchecked.Pass,
                ).length
              }{" "}
              Pass
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-destructive" />
              {
                Object.values(localItems).filter(
                  (i) => i.status === Variant_NA_Fail_Pass_Unchecked.Fail,
                ).length
              }{" "}
              Fail
            </span>
            <span className="flex items-center gap-1">
              <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />
              {
                Object.values(localItems).filter(
                  (i) => i.status === Variant_NA_Fail_Pass_Unchecked.NA,
                ).length
              }{" "}
              N/A
            </span>
            <span className="flex items-center gap-1">
              <Circle className="w-3.5 h-3.5 text-muted-foreground" />
              {TOTAL_ITEMS - checkedCount} Pending
            </span>
          </div>
        </div>

        {/* General Information */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-4">
          <div className="bg-section-pale border-b border-border px-5 py-3">
            <h2 className="font-semibold text-primary text-sm">
              General Information
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-sm font-medium">
                Client Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={meta.clientName}
                onChange={(e) => handleMetaChange("clientName", e.target.value)}
                data-ocid="checklist.client_name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="systemId" className="text-sm font-medium">
                System ID
              </Label>
              <Input
                id="systemId"
                placeholder="e.g. SYS-001"
                value={meta.systemId}
                onChange={(e) => handleMetaChange("systemId", e.target.value)}
                data-ocid="checklist.system_id.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inspectedBy" className="text-sm font-medium">
                Inspected By <span className="text-destructive">*</span>
              </Label>
              <Input
                id="inspectedBy"
                placeholder="Technician name"
                value={meta.inspectedBy}
                onChange={(e) =>
                  handleMetaChange("inspectedBy", e.target.value)
                }
                data-ocid="checklist.inspected_by.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={meta.date}
                onChange={(e) => handleMetaChange("date", e.target.value)}
                data-ocid="checklist.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solarUnits" className="text-sm font-medium">
                Solar Generation (units)
              </Label>
              <Input
                id="solarUnits"
                placeholder="e.g. 450 kWh"
                value={meta.solarGenerationUnits}
                onChange={(e) =>
                  handleMetaChange("solarGenerationUnits", e.target.value)
                }
                data-ocid="checklist.solar_units.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solarPerMonth" className="text-sm font-medium">
                Solar Generation Per Month
              </Label>
              <Input
                id="solarPerMonth"
                placeholder="e.g. 450 kWh/month"
                value={meta.solarGenerationPerMonth}
                onChange={(e) =>
                  handleMetaChange("solarGenerationPerMonth", e.target.value)
                }
                data-ocid="checklist.solar_per_month.input"
              />
            </div>
          </div>
        </div>

        {/* Checklist Sections */}
        {CHECKLIST_SECTIONS.map((section, sIdx) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sIdx * 0.05 }}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-4"
            >
              <div
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 border-b border-border",
                  section.darkHeader
                    ? "bg-section-dark text-white"
                    : "bg-section-pale text-primary",
                )}
              >
                <SectionIcon className="w-4 h-4" />
                <h2 className="font-semibold text-sm">{section.title}</h2>
              </div>
              <div className="divide-y divide-border">
                {section.items.map((item) => {
                  const itemState = localItems[item.id] ?? {
                    status: Variant_NA_Fail_Pass_Unchecked.Unchecked,
                    comment: "",
                  };
                  return (
                    <ChecklistRow
                      key={item.id}
                      itemId={item.id}
                      task={item.task}
                      status={itemState.status}
                      comment={itemState.comment}
                      onStatusChange={handleStatusChange}
                      onCommentChange={handleCommentChange}
                      onCommentBlur={handleCommentBlur}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Notes */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-4">
          <div className="bg-section-pale border-b border-border px-5 py-3">
            <h2 className="font-semibold text-primary text-sm">
              Notes &amp; Recommendations
            </h2>
          </div>
          <div className="p-5">
            <Textarea
              placeholder="Enter any observations, recommendations, or follow-up actions..."
              value={meta.notes}
              onChange={(e) => handleMetaChange("notes", e.target.value)}
              rows={5}
              className="resize-none"
              data-ocid="checklist.notes.textarea"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-card">
          {!isFormComplete && (
            <div
              className="flex items-center gap-2 text-sm text-warning-foreground bg-warning/10 border border-warning/30 rounded-md px-3 py-2 mb-4"
              data-ocid="checklist.validation.error_state"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-warning" />
              <span>
                {checkedCount < TOTAL_ITEMS
                  ? `Complete all ${TOTAL_ITEMS - checkedCount} remaining checklist items. `
                  : ""}
                {!meta.clientName || !meta.inspectedBy
                  ? "Client Name and Inspected By are required."
                  : ""}
              </span>
            </div>
          )}
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base font-semibold shadow-card"
            disabled={!isFormComplete || submitReport.isPending}
            onClick={handleSubmit}
            data-ocid="checklist.submit.primary_button"
          >
            {submitReport.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting
                Report...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit &amp; Send Report
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Submitting will generate a completion report. The shareable link
            will be copied to your clipboard automatically.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface ChecklistRowProps {
  itemId: string;
  task: string;
  status: Variant_NA_Fail_Pass_Unchecked;
  comment: string;
  onStatusChange: (id: string, s: Variant_NA_Fail_Pass_Unchecked) => void;
  onCommentChange: (id: string, c: string) => void;
  onCommentBlur: (id: string) => void;
}

function ChecklistRow({
  itemId,
  task,
  status,
  comment,
  onStatusChange,
  onCommentChange,
  onCommentBlur,
}: ChecklistRowProps) {
  const rowBg =
    status === Variant_NA_Fail_Pass_Unchecked.Pass
      ? "bg-success/5"
      : status === Variant_NA_Fail_Pass_Unchecked.Fail
        ? "bg-destructive/5"
        : status === Variant_NA_Fail_Pass_Unchecked.NA
          ? "bg-muted/40"
          : "";

  return (
    <div className={cn("px-5 py-3 transition-colors", rowBg)}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-snug">{task}</p>
          {(status === Variant_NA_Fail_Pass_Unchecked.Fail || comment) && (
            <input
              type="text"
              placeholder="Add comment..."
              value={comment}
              onChange={(e) => onCommentChange(itemId, e.target.value)}
              onBlur={() => onCommentBlur(itemId)}
              className="mt-2 w-full text-xs border border-border rounded px-2 py-1 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              data-ocid="checklist.item_comment.input"
            />
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusButton
            label="Pass"
            active={status === Variant_NA_Fail_Pass_Unchecked.Pass}
            activeClass="bg-success text-white border-success"
            idleClass="border-border text-muted-foreground hover:border-success hover:text-success"
            onClick={() =>
              onStatusChange(itemId, Variant_NA_Fail_Pass_Unchecked.Pass)
            }
          />
          <StatusButton
            label="Fail"
            active={status === Variant_NA_Fail_Pass_Unchecked.Fail}
            activeClass="bg-destructive text-white border-destructive"
            idleClass="border-border text-muted-foreground hover:border-destructive hover:text-destructive"
            onClick={() =>
              onStatusChange(itemId, Variant_NA_Fail_Pass_Unchecked.Fail)
            }
          />
          <StatusButton
            label="N/A"
            active={status === Variant_NA_Fail_Pass_Unchecked.NA}
            activeClass="bg-muted-foreground text-white border-muted-foreground"
            idleClass="border-border text-muted-foreground hover:border-muted-foreground"
            onClick={() =>
              onStatusChange(itemId, Variant_NA_Fail_Pass_Unchecked.NA)
            }
          />
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  label,
  active,
  activeClass,
  idleClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  idleClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-xs font-semibold rounded border transition-colors",
        active ? activeClass : idleClass,
      )}
    >
      {label}
    </button>
  );
}
