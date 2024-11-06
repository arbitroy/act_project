import React from 'react';
import { Card } from "@/components/ui/card";
import Image from 'next/image';
interface DailyReport {
    id: string | number;
    date: string;
    job_number: string;
    table_number: string;
    element_code: string;
    element_volume: string | number;
    already_casted: string | number;
    already_casted_volume: string | number;
    remaining_qty: string | number;
    planned_volume: string | number | null;
    planned_amount: string | number | null;
    actual_casted: string | number;
    actual_volume: string | number;
    mep: string;
    remarks?: string;
}

interface PDFExportViewProps {
    dailyReports: DailyReport[];
}

const PDFExportView: React.FC<PDFExportViewProps> = ({ dailyReports }) => {
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

    const calculateTotals = () => {
        return dailyReports.reduce((acc, report) => ({
            alreadyCasted: acc.alreadyCasted + safeNumber(report.already_casted),
            alreadyCastedVolume: acc.alreadyCastedVolume + safeNumber(report.already_casted_volume),
            remainingQty: acc.remainingQty + safeNumber(report.remaining_qty),
            totalVolume: acc.totalVolume + (50 * safeNumber(report.element_volume)),
            plannedAmount: acc.plannedAmount + safeNumber(report.planned_amount),
            plannedVolume: acc.plannedVolume + safeNumber(report.planned_volume),
            actualCasted: acc.actualCasted + safeNumber(report.actual_casted),
            actualVolume: acc.actualVolume + safeNumber(report.actual_volume),
            totalRequired: acc.totalRequired + 50 // Adding total required to calculations
        }), {
            alreadyCasted: 0,
            alreadyCastedVolume: 0,
            remainingQty: 0,
            totalVolume: 0,
            plannedAmount: 0,
            plannedVolume: 0,
            actualCasted: 0,
            actualVolume: 0,
            totalRequired: 0
        });
    };
    const calculateCompletionPercentage = (totals: ReturnType<typeof calculateTotals>) => {
        const completedAmount = totals.alreadyCasted;
        const totalRequired = totals.totalRequired;
        return totalRequired > 0 ? (completedAmount / totalRequired) * 100 : 0;
    };

    const totals = calculateTotals();
    const completionPercentage = calculateCompletionPercentage(totals);



    return (
        <Card className="p-8 w-full bg-white shadow-lg print:shadow-none print:p-4">
            <div className="space-y-6 print:space-y-2">
                {/* Header */}
                <div className="border-b border-green-600 print:border-green-600">
                    <div className="flex items-start space-x-4 print:space-x-2">
                        {/* Logo Section */}
                        <div className="flex-shrink-0 print:w-20">
                            <Image
                                priority
                                src="/act-precast-logo.svg"
                                alt="ACT PRECAST"
                                width={100}
                                height={150}
                                className="rounded-full aspect-square object-cover print:w-20 print:h-20"
                            />
                        </div>

                        {/* Title Section */}
                        <div className="flex-grow">
                            <div className="text-center border-b border-green-600 pb-2 print:pb-1">
                                <h1 className="text-xl font-bold text-black print:text-base">
                                    Integrated Management System
                                </h1>
                                <h2 className="text-lg font-semibold text-black mt-1 print:text-sm">
                                    Daily Production Report
                                </h2>
                            </div>

                            {/* Document Info Grid */}
                            <div className="grid grid-cols-3 gap-4 mt-4 text-sm print:gap-2 print:mt-2 print:text-xs">
                                <div className="space-y-1">
                                    <p><span className="font-semibold">Issued by:</span> Tech Department</p>
                                    <p><span className="font-semibold">Document Code:</span> ACT-MS-FORM</p>
                                </div>
                                <div className="space-y-1">
                                    <p><span className="font-semibold">Document No:</span> FM PR-001</p>
                                    <p><span className="font-semibold">Rev No:</span> 0</p>
                                </div>
                                <div className="space-y-1">
                                    <p><span className="font-semibold">Issued on:</span> {formatDate(new Date())}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location and Reporting Date */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-green-200 text-sm print:gap-2 print:mt-2 print:pt-2 print:text-xs">
                        <div>
                            <span className="font-semibold">Location:</span> ACT Factory - DIC
                        </div>
                        <div>
                            <span className="font-semibold">Reporting Date:</span> {formatDate(new Date())}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-green-300 rounded-lg print:border-green-300">
                    <table className="w-full text-sm border-collapse print:text-[8pt]">
                        <thead>
                            <tr className="bg-green-600 print:bg-green-600">
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">S/N</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Job No</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Table No</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Element ID</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Already Casted (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Already Volume (m3)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Remaining Qty (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Total Required</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Vol m3</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Total Vol m3</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Weight</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Planned to Cast (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Planned Volume (m3)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Actual Casted (nos)</th>
                                <th className="border-b border-green-400 p-3 text-right text-white font-semibold">Actual Volume (m3)</th>
                                <th className="border-b border-green-400 p-3 text-center text-white font-semibold">MEP</th>
                                <th className="border-b border-green-400 p-3 text-left text-white font-semibold">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="print:text-[8pt]">
                            {dailyReports.map((report, index) => (
                                <tr key={report.id}>
                                    <td className="border-b border-green-200 p-3 text-black">{String(index + 1).padStart(3, '0')}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.job_number}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.table_number}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.element_code}</td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.already_casted).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.already_casted_volume).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.remaining_qty).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">50</td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.element_volume).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {(safeNumber(report.element_volume) * 50).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {(safeNumber(report.element_volume) * 2.5).toFixed(3)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.planned_amount).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.planned_volume).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.actual_casted).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-right text-black">
                                        {safeNumber(report.actual_volume).toFixed(2)}
                                    </td>
                                    <td className="border-b border-green-200 p-3 text-center text-black">{report.mep}</td>
                                    <td className="border-b border-green-200 p-3 text-black">{report.remarks}</td>
                                </tr>
                            ))}
                            {/* Grand Total Row */}
                            <tr className="bg-green-600 font-bold">
                                <td colSpan={4} className="p-3 text-right text-white">GRAND TOTAL</td>
                                <td className="p-3 text-right text-white">{totals.alreadyCasted.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{totals.alreadyCastedVolume.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{totals.remainingQty.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{totals.totalRequired}</td>
                                <td className="p-3 text-right text-white">-</td>
                                <td className="p-3 text-right text-white">{totals.totalVolume.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{(totals.totalVolume * 2.5).toFixed(3)}</td>
                                <td className="p-3 text-right text-white">{totals.plannedAmount.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{totals.plannedVolume.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{totals.actualCasted.toFixed(2)}</td>
                                <td className="p-3 text-right text-white">{totals.actualVolume.toFixed(2)}</td>
                                <td colSpan={2} className="p-3 text-center text-white">
                                    <div>
                                        <div className="font-bold">Overall Completion</div>
                                        <div className="text-xl">{completionPercentage.toFixed(1)}%</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>



            </div>
        </Card>
    );
};

export default PDFExportView;