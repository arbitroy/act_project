import { z } from 'zod';

// Enums
export const MEPOption = {
    MEP: 'MEP',
    NO: 'NO'
} as const;
export const RFTSource = {
    ACT: 'ACT',
    HAMDAN: 'HAMDAN',
    OTHER: 'OTHER'
} as const;

export const RemarkType = {
    PLANNED: 'PLANNED',
    NOT_DONE: 'NOT_DONE',
    ADVANCED: 'ADVANCED',
    CUSTOM: 'CUSTOM'
} as const;

export const PREDEFINED_REMARKS = {
    PLANNED: 'Cast as planned',
    NOT_DONE: 'MOLD ASSEMBLY & RFT FITTING NOT DONE',
    ADVANCED: 'Cast as advanced planned'
} as const;

// Types
export type MEPOption = typeof MEPOption[keyof typeof MEPOption];
export type RemarkType = typeof RemarkType[keyof typeof RemarkType];
export type RFTSource = typeof RFTSource[keyof typeof RFTSource];

// Base types
export interface Job {
    readonly id: number;
    readonly job_number: string;
    readonly description: string;
}

export interface TableDB {
    readonly id: number;
    readonly table_number: string;
    readonly description: string;
}

export interface Element {
    readonly id: number;
    readonly element_id: string;
    readonly volume: string;
}

export interface PlannedCasting {
    id: number;
    element_id: number;
    planned_volume: number;
    planned_amount: number;
    planned_date: string;
}

export interface RemainingQuantity {
    elementId: number;
    totalVolume: number;
    totalCasted: number;
    remainingVolume: number;
    completionPercentageVolume: number;
    totalPlannedAmount: number;
    totalCastedAmount: number;
    remainingAmount: number;
    completionPercentageAmount: number;
}

// Zod schema for form validation
export const dailyReportSchema = z.object({
    date: z.string().min(1, "Date is required"),
    user_id: z.number().int().min(1, "User ID is required"),
    job_id: z.number().int().min(1, "Job is required"),
    table_id: z.number().int().min(1, "Table is required"),
    element_id: z.number().int().min(1, "Element is required"),
    planned_volume: z.number().min(0, "Volume must be positive"),
    planned_amount: z.number().int().min(1, "Amount must be at least 1"),
    mep: z.enum([MEPOption.MEP, MEPOption.NO]),
    rft: z.enum([RFTSource.ACT, RFTSource.HAMDAN, RFTSource.OTHER]),
    remarkType: z.enum([RemarkType.PLANNED, RemarkType.NOT_DONE, RemarkType.ADVANCED, RemarkType.CUSTOM]),
    customRemark: z.string().optional(),
});

// Form data type derived from schema
export type DailyReportFormData = z.infer<typeof dailyReportSchema>;

// Record type for table display
export interface DailyReportRecord {
    id: number;
    job_number: string;
    table_number: string;
    element_id: string;
    planned_amount: number;
    planned_volume: number;
    mep: MEPOption;
    rft: RFTSource;
    remarks: string;
    original_data: DailyReportFormData;
}


export interface StatusItemProps {
    label: string;
    value: string | number;
}

export interface PlannedCastingsTableProps {
    plannedCastings: PlannedCasting[];
    elements: Element[];
}

export interface FieldErrorProps {
    error?: {
        message?: string;
    };
}