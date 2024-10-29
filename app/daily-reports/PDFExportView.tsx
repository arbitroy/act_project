import React from 'react';
import { Card } from "@/components/ui/card";
import Image from 'next/image'

interface DailyReport {
    id: string | number;
    job_number: string;
    table_number: string;
    element_code: string;
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
    // [Previous helper functions remain the same]
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

    const calculateAlreadyCasted = (reports: DailyReport[]): number => {
        return reports.reduce((sum, report) => sum + safeNumber(report.already_casted), 0);
    };

    const calculateRemainingQuantity = (reports: DailyReport[]): number => {
        return reports.reduce((sum, report) => sum + safeNumber(report.remaining_qty), 0);
    };

    const today = new Date();
    const totalAlreadyCasted = calculateAlreadyCasted(dailyReports);
    const totalRemainingQuantity = calculateRemainingQuantity(dailyReports);
    const totalVolume = calculateTotalVolume(dailyReports);
    const totalWeight = calculateTotalWeight(totalVolume);
    const totalPlannedAmount = calculateTotalPlannedAmount(dailyReports);
    const totalPlannedVolume = calculateTotalPlannedVolume(dailyReports);

    return (
        <Card className="p-8 w-full bg-white shadow-lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center bg-green-100 p-4 rounded-lg border-l-4 border-green-600">
                    <Image priority src='/act-precast-logo.svg' alt="ACT PRECAST" width={100} height={150} className="rounded-full aspect-square object-cover" />
                    <div className="ml-4 flex-1">
                        <h1 className="text-xl font-bold text-black border-b-2 border-green-600 pb-2 mb-2">TECH DEPARTMENT</h1>
                        <div className="text-sm text-black grid grid-cols-2 gap-x-8 gap-y-1">
                            <p>ACT- IMS- FORM</p>
                            <p>FM PR-001</p>
                            <p>Rev. 0</p>
                            <p>{formatDate(today)}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-green-300 rounded-lg">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-green-600">
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">S/N</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Job No</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Table No</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Element ID</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Already Casted (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Remaining Qty (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Vol</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Weight</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Planned to Cast (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Planned Volume (m3)</th>
                                <th className="border-b border-green-400 p-3 text-center text-white font-semibold">MEP</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyReports.map((report, index) => (
                                <tr key={report.id} className="hover:bg-green-50 transition-colors">
                                    <td className="border-b border-green-200 p-3 text-black">{index + 1}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.job_number}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.table_number}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.element_code}</td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.already_casted)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.remaining_qty)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.planned_volume).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {(safeNumber(report.planned_volume) * 2.5).toFixed(3)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.planned_amount)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {(safeNumber(report.planned_volume) * safeNumber(report.planned_amount)).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-center text-black">{report.mep}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.remarks}</td>
                                </tr>
                            ))}
                            {/* Grand Total Row */}
                            <tr className="bg-green-600 font-bold">
                                <td colSpan={4} className="p-3 text-right text-white">GRAND TOTAL</td>
                                <td className="p-3 text-right text-white">
                                    {totalAlreadyCasted.toFixed(2)}
                                </td>
                                <td className="p-3 text-right text-white">
                                    {totalRemainingQuantity.toFixed(2)}
                                </td>
                                <td className="p-3 text-right text-white">
                                    {totalVolume.toFixed(2)}
                                </td>
                                <td className="p-3 text-right text-white">
                                    {totalWeight.toFixed(3)}
                                </td>
                                <td className="p-3 text-right text-white">
                                    {totalPlannedAmount}
                                </td>
                                <td className="p-3 text-right text-white">
                                    {totalPlannedVolume.toFixed(2)}
                                </td>
                                <td colSpan={2} className="p-3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between">
                        <div>
                            <p className="font-bold text-black">Issued by:</p>
                            <div className="mt-8 border-t-2 border-green-600 w-32"></div>
                        </div>
                    </div>
                    <div className="text-sm text-black bg-green-100 p-4 rounded-lg space-y-1 border-l-4 border-green-600">
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