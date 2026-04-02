import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, ChevronRight, Loader2, Save, Send } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PhotoAttachments from "../components/PhotoAttachments";
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
import { copyToClipboard } from "../lib/clipboard";
import {
  combineNotesAndPhotos,
  parseNotesAndPhotos,
} from "../lib/photoStorage";

export default function ChecklistForm() {
  const { reportId } = useParams({ from: "/checklist/$reportId" });

  const { data: report, isLoading } = useGetReport(reportId);
  const updateItem = useUpdateChecklistItem(reportId);
  const updateMeta = useUpdateMetadata(reportId);
  const submitReport = useSubmitReport();

  const [submitted, setSubmitted] = useState(false);
  const [reportName, setReportName] = useState(
    () => localStorage.getItem(`reportName:${reportId}`) || "",
  );

  const handleReportNameChange = (value: string) => {
    setReportName(value);
    localStorage.setItem(`reportName:${reportId}`, value);
  };

  const [meta, setMeta] = useState({
    clientName: "",
    systemId: "",
    inspectedBy: "",
    date: new Date().toISOString().split("T")[0],
    solarGenerationUnits: "",
    solarGenerationPerMonth: "",
    // notes field stores combined notes+photos using photoStorage delimiter
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

  // Notes textarea shows only the text portion (not the embedded photo data)
  const { notes: notesText } = parseNotesAndPhotos(meta.notes);

  const handleNotesTextChange = (newText: string) => {
    const { photos } = parseNotesAndPhotos(meta.notes);
    handleMetaChange("notes", combineNotesAndPhotos(newText, photos));
  };

  // PhotoAttachments updates the combined notes string
  const handleNotesChange = (newCombined: string) => {
    handleMetaChange("notes", newCombined);
  };

  const [localItems, setLocalItems] = useState<
    Record<string, Variant_NA_Fail_Pass_Unchecked>
  >({});

  const itemsSeeded = useRef(false);
  useEffect(() => {
    if (report && !itemsSeeded.current) {
      itemsSeeded.current = true;
      const map: Record<string, Variant_NA_Fail_Pass_Unchecked> = {};
      for (const item of report.items) {
        map[item.id] = item.status;
      }
      setLocalItems(map);
    }
  }, [report]);

  const handleStatusChange = (
    itemId: string,
    status: Variant_NA_Fail_Pass_Unchecked,
  ) => {
    setLocalItems((prev) => ({ ...prev, [itemId]: status }));
    updateItem.mutate({ itemId, status, comment: "" });
  };

  const checkedCount = Object.values(localItems).filter(
    (s) => s !== Variant_NA_Fail_Pass_Unchecked.Unchecked,
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
      // Flush any pending debounced save with the latest meta (including photos)
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await updateMeta.mutateAsync(meta);
      await submitReport.mutateAsync(reportId);
      const reportUrl = `${window.location.origin}/reports/${reportId}`;
      const copied = await copyToClipboard(reportUrl);
      if (copied) {
        toast.success("Report submitted! Link copied to clipboard.", {
          description: "Paste and share it via WhatsApp or SMS.",
          duration: 5000,
        });
      } else {
        toast.success("Report submitted successfully!", {
          description: `Share this link: ${reportUrl}`,
          duration: 8000,
        });
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
        status: localItems[item.id] ?? item.status,
        comment: "",
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
              {checkedCount} of {TOTAL_ITEMS} items checked
            </span>
            <span className="text-sm font-semibold text-primary">
              {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
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
                  const status =
                    localItems[item.id] ??
                    Variant_NA_Fail_Pass_Unchecked.Unchecked;
                  const isChecked =
                    status !== Variant_NA_Fail_Pass_Unchecked.Unchecked;
                  return (
                    <ChecklistRow
                      key={item.id}
                      itemId={item.id}
                      task={item.task}
                      isChecked={isChecked}
                      onToggle={(checked) =>
                        handleStatusChange(
                          item.id,
                          checked
                            ? Variant_NA_Fail_Pass_Unchecked.Pass
                            : Variant_NA_Fail_Pass_Unchecked.Unchecked,
                        )
                      }
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Notes & Photos */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-4">
          <div className="bg-section-pale border-b border-border px-5 py-3">
            <h2 className="font-semibold text-primary text-sm">
              Notes &amp; Recommendations
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <Textarea
              placeholder="Enter any observations, recommendations, or follow-up actions..."
              value={notesText}
              onChange={(e) => handleNotesTextChange(e.target.value)}
              rows={5}
              className="resize-none"
              data-ocid="checklist.notes.textarea"
            />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Photo Attachments
              </p>
              <PhotoAttachments
                combinedNotes={meta.notes}
                onNotesChange={handleNotesChange}
              />
            </div>
          </div>
        </div>

        {/* Save Report As */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-4">
          <div className="bg-section-pale border-b border-border px-5 py-3 flex items-center gap-2">
            <Save className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-primary text-sm">
              Save Report As
            </h2>
          </div>
          <div className="p-5">
            <Label htmlFor="reportName" className="text-sm font-medium">
              Report Name
            </Label>
            <p className="text-xs text-muted-foreground mb-2 mt-0.5">
              Give this report a custom name for easy identification (optional)
            </p>
            <Input
              id="reportName"
              placeholder={`e.g. ${monthName} ${String(report.year)} – ${meta.clientName || "Client Name"}`}
              value={reportName}
              onChange={(e) => handleReportNameChange(e.target.value)}
              data-ocid="checklist.report_name.input"
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
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

function ChecklistRow({
  itemId,
  task,
  isChecked,
  onToggle,
}: ChecklistRowProps) {
  return (
    <label
      htmlFor={`item-${itemId}`}
      className={cn(
        "flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-muted/30",
        isChecked && "bg-success/5",
      )}
    >
      <Checkbox
        id={`item-${itemId}`}
        checked={isChecked}
        onCheckedChange={(checked) => onToggle(checked === true)}
        className="w-5 h-5 flex-shrink-0"
        data-ocid="checklist.item.checkbox"
      />
      <span
        className={cn(
          "text-sm leading-snug flex-1",
          isChecked ? "text-muted-foreground line-through" : "text-foreground",
        )}
      >
        {task}
      </span>
    </label>
  );
}
