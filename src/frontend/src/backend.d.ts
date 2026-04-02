import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Report {
    id: string;
    month: bigint;
    submitted: boolean;
    clientName: string;
    date: string;
    createdAt: bigint;
    inspectedBy: string;
    year: bigint;
    submittedAt?: bigint;
    systemId: string;
    solarGenerationPerMonth: string;
    notes: string;
    items: Array<ChecklistItem>;
    solarGenerationUnits: string;
}
export interface UserProfile {
    name: string;
}
export interface ChecklistItem {
    id: string;
    status: Variant_NA_Fail_Pass_Unchecked;
    task: string;
    section: string;
    comment: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_NA_Fail_Pass_Unchecked {
    NA = "NA",
    Fail = "Fail",
    Pass = "Pass",
    Unchecked = "Unchecked"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createReport(month: bigint, year: bigint): Promise<string>;
    deleteReport(reportId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReport(reportId: string): Promise<Report>;
    getReportPhotos(reportId: string): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listReports(): Promise<Array<Report>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitReport(reportId: string): Promise<void>;
    updateChecklistItem(reportId: string, itemId: string, status: Variant_NA_Fail_Pass_Unchecked, comment: string): Promise<void>;
    updateReportMetadata(reportId: string, clientName: string, systemId: string, inspectedBy: string, date: string, solarGenerationUnits: string, solarGenerationPerMonth: string, notes: string): Promise<void>;
    updateReportPhotos(reportId: string, photos: string): Promise<void>;
}
