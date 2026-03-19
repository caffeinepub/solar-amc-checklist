import { Box, LayoutGrid, Settings, Sun, Wrench, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ChecklistItemDef {
  id: string;
  task: string;
}

export interface ChecklistSectionDef {
  id: string;
  title: string;
  icon: LucideIcon;
  items: ChecklistItemDef[];
  darkHeader?: boolean;
}

export const CHECKLIST_SECTIONS: ChecklistSectionDef[] = [
  {
    id: "solar-modules",
    title: "Solar Modules",
    icon: Sun,
    items: [
      { id: "item-1", task: "Cleaning & wiping with fresh water" },
      {
        id: "item-2",
        task: "Visual Inspection of modules, mounting clamps, MC4 connectors",
      },
      {
        id: "item-3",
        task: "Check modules for any broken glass/discolouration, misalignment",
      },
    ],
  },
  {
    id: "module-mounting",
    title: "Module Mounting Structure",
    icon: Wrench,
    items: [
      {
        id: "item-4",
        task: "Visual inspection of mounting structures, screws and fasteners",
      },
      {
        id: "item-5",
        task: "Tightening of screw and fasteners etc. As Needed",
      },
      { id: "item-6", task: "Check for rust accumulation" },
    ],
  },
  {
    id: "junction-box",
    title: "Junction Box",
    icon: Box,
    items: [
      {
        id: "item-7",
        task: "Checking and tightening of solar inter-connection",
      },
      {
        id: "item-8",
        task: "Visual inspection of junction box and wiring etc",
      },
      { id: "item-9", task: "Tightening any interconnection as needed" },
    ],
  },
  {
    id: "inverters",
    title: "Inverters",
    icon: Zap,
    items: [
      { id: "item-10", task: "General cleaning" },
      { id: "item-11", task: "Check for LCD display of inverters" },
      { id: "item-12", task: "Check integrity of wiring" },
      {
        id: "item-13",
        task: "Visual inspection of mechanical fixings of inverters",
      },
      { id: "item-14", task: "Inspection of cables" },
      { id: "item-15", task: "Visual inspection of AC and DC cables" },
    ],
  },
  {
    id: "distribution-boards",
    title: "Distribution Boards",
    icon: LayoutGrid,
    darkHeader: true,
    items: [
      {
        id: "item-16",
        task: "Checking ACDB for functioning, connections, metering, switchgears etc",
      },
      {
        id: "item-17",
        task: "Checking DCDB for functioning, connections, metering, switchgears etc",
      },
    ],
  },
  {
    id: "general-system",
    title: "General System Check and Cleaning",
    icon: Settings,
    darkHeader: true,
    items: [
      {
        id: "item-18",
        task: "Inspect visual all connector, contactor, switchboards and wiring for any sign of corrosion and/or burning",
      },
      { id: "item-19", task: "Checking for MCB and fuses" },
      { id: "item-20", task: "Checking of overall system" },
      { id: "item-21", task: "Preparing total report of the visit" },
    ],
  },
];

export const TOTAL_ITEMS = CHECKLIST_SECTIONS.reduce(
  (acc, s) => acc + s.items.length,
  0,
);

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
