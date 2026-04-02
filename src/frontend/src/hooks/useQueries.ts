import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Report, Variant_NA_Fail_Pass_Unchecked } from "../backend.d";
import { useActor } from "./useActor";

export { Variant_NA_Fail_Pass_Unchecked };
export type { Report };

export function useListReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReport(reportId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Report>({
    queryKey: ["report", reportId],
    queryFn: async () => {
      if (!actor || !reportId) throw new Error("No actor or reportId");
      return actor.getReport(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useGetReportPhotos(reportId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["reportPhotos", reportId],
    queryFn: async () => {
      if (!actor || !reportId) return "[]";
      return actor.getReportPhotos(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useUpdateReportPhotos(reportId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photos: string) => {
      if (!actor) throw new Error("No actor");
      return actor.updateReportPhotos(reportId, photos);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reportPhotos", reportId] });
    },
  });
}

export function useCreateReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.createReport(BigInt(month), BigInt(year));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateChecklistItem(reportId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      status,
      comment,
    }: {
      itemId: string;
      status: Variant_NA_Fail_Pass_Unchecked;
      comment: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateChecklistItem(reportId, itemId, status, comment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", reportId] });
    },
  });
}

export function useUpdateMetadata(reportId: string) {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (meta: {
      clientName: string;
      systemId: string;
      inspectedBy: string;
      date: string;
      solarGenerationUnits: string;
      solarGenerationPerMonth: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateReportMetadata(
        reportId,
        meta.clientName,
        meta.systemId,
        meta.inspectedBy,
        meta.date,
        meta.solarGenerationUnits,
        meta.solarGenerationPerMonth,
        meta.notes,
      );
    },
  });
}

export function useSubmitReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.submitReport(reportId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteReport(reportId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
