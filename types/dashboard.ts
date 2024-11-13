export interface DailyCastingData {
    date: string;
    planned_amount: number;
    actual_amount: number;
}

export interface ElementCompletionData {
    status: 'Completed' | 'In Progress' | 'Pending';
    value: number;
}

export interface MonthlyProgressData {
    month: string;
    planned: number;
    actual: number;
}

export interface DailyCastingAmountData {
    date: string;
    amount: number;
}

export interface DailyCastingVolumeData {
    date: string;
    volume: number;
    cumulativeVolume: number;
}

export interface DashboardData {
    dailyCastingData: DailyCastingData[];
    elementCompletionData: ElementCompletionData[];
    monthlyProgressData: MonthlyProgressData[];
    dailyCastingAmountData: DailyCastingAmountData[];
    dailyCastingVolumeData: DailyCastingVolumeData[];
}

export interface ChartColors {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    border: string;
}