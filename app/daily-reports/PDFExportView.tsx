import React from 'react';
import { Card } from "@/components/ui/card";

interface DailyReport {
    id: string | number;
    job_number: string;
    table_number: string;
    element_id: string;
    already_casted: string | number;
    remaining_qty: string | number;
    planned_volume: string | number;
    planned_amount: string | number;
    mep: string;
    remarks?: string;
}

interface PDFExportViewProps {
    dailyReports: DailyReport[];
}

const PDFExportView: React.FC<PDFExportViewProps> = ({ dailyReports }) => {
    // Helper function to safely convert to number and handle potential invalid inputs
    const safeNumber = (value: string | number | null | undefined): number => {
        if (value === null || value === undefined || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const calculateTotalVolume = (reports: DailyReport[]): number => {
        return reports.reduce((sum, report) => sum + safeNumber(report.planned_volume), 0);
    };

    const calculateTotalWeight = (volume: number): number => {
        return volume * 2.5;
    };

    const calculateTotalPlannedAmount = (reports: DailyReport[]): number => {
        return reports.reduce((sum, report) => sum + safeNumber(report.planned_amount), 0);
    };

    const calculateTotalPlannedVolume = (reports: DailyReport[]): number => {
        return reports.reduce((sum, report) =>
            sum + (safeNumber(report.planned_volume) * safeNumber(report.planned_amount)), 0);
    };

    const today = new Date();
    const totalVolume = calculateTotalVolume(dailyReports);
    const totalWeight = calculateTotalWeight(totalVolume);
    const totalPlannedAmount = calculateTotalPlannedAmount(dailyReports);
    const totalPlannedVolume = calculateTotalPlannedVolume(dailyReports);

    return (
        <Card className="p-8 w-full">
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold">TECH DEPARTMENT</h1>
                    <div className="text-sm">
                        <p>ACT- IMS- FORM</p>
                        <p>FM PR-001</p>
                        <p>0</p>
                        <p>{formatDate(today)}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border">
                                <th className="border p-2 text-left">S/N</th>
                                <th className="border p-2 text-left">Job No</th>
                                <th className="border p-2 text-left">Table No</th>
                                <th className="border p-2 text-left">Element ID</th>
                                <th className="border p-2 text-right">Already Casted (nos)</th>
                                <th className="border p-2 text-right">Remaining Qty (nos)</th>
                                <th className="border p-2 text-right">Vol</th>
                                <th className="border p-2 text-right">Weight</th>
                                <th className="border p-2 text-right">Planned to Cast (nos)</th>
                                <th className="border p-2 text-right">Planned Volume (m3)</th>
                                <th className="border p-2 text-center">MEP</th>
                                <th className="border p-2 text-left">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyReports.map((report, index) => (
                                <tr key={report.id} className="border hover:bg-gray-50">
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">{report.job_number}</td>
                                    <td className="border p-2">{report.table_number}</td>
                                    <td className="border p-2">{report.element_id}</td>
                                    <td className="border p-2 text-right">
                                        {safeNumber(report.already_casted)}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {safeNumber(report.remaining_qty)}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {safeNumber(report.planned_volume).toFixed(2)}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {(safeNumber(report.planned_volume) * 2.5).toFixed(3)}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {safeNumber(report.planned_amount)}
                                    </td>
                                    <td className="border p-2 text-right">
                                        {(safeNumber(report.planned_volume) * safeNumber(report.planned_amount)).toFixed(2)}
                                    </td>
                                    <td className="border p-2 text-center">{report.mep}</td>
                                    <td className="border p-2">{report.remarks}</td>
                                </tr>
                            ))}
                            {/* Grand Total Row */}
                            <tr className="border font-bold bg-gray-50">
                                <td colSpan={6} className="border p-2 text-right">GRAND TOTAL</td>
                                <td className="border p-2 text-right">
                                    {totalVolume.toFixed(2)}
                                </td>
                                <td className="border p-2 text-right">
                                    {totalWeight.toFixed(3)}
                                </td>
                                <td className="border p-2 text-right">
                                    {totalPlannedAmount}
                                </td>
                                <td className="border p-2 text-right">
                                    {totalPlannedVolume.toFixed(2)}
                                </td>
                                <td colSpan={2} className="border p-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between">
                        <div>
                            <p className="font-bold">Issued by:</p>
                            <div className="mt-8 border-t border-black w-32"></div>
                        </div>
                    </div>
                    <div className="text-sm">
                        <p>Document Code</p>
                        <p>Document S No.</p>
                        <p>Rev. No</p>
                        <p>Issued By:</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PDFExportView;