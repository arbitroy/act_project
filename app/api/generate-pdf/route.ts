import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';


interface DailyReport {
    id: string;
    date: string;
    job_number: string;
    table_number: string;
    element_code: string;
    element_volume: number;
    already_casted: number;
    already_casted_volume: number;
    remaining_qty: number;
    planned_volume: number;
    planned_amount: number;
    actual_casted: number;
    actual_volume: number;
    mep: string;
    rft: string;
    remarks: string;
}

interface RFTSummary {
    [key: string]: {
        count: number;
        volume: number;
    };
}



const getRowColor = (remarks?: string): string => {
    if (!remarks) return '';
    const remarkLower = remarks.toLowerCase().trim();
    if (remarkLower === 'cast as planned') {
        return 'bg-lime-100';
    } else if (remarkLower === 'mold assembly & rft fitting not done') {
        return 'bg-rose-50';
    } else if (remarkLower === 'cast as advanced planned') {
        return 'bg-blue-100';
    }
    return '';
};

const calculateTotals = (dailyReports: DailyReport[]) => {
    return dailyReports.reduce((acc, report) => ({
        alreadyCasted: acc.alreadyCasted + Number(report.already_casted || 0),
        alreadyCastedVolume: acc.alreadyCastedVolume + Number(report.already_casted_volume || 0),
        remainingQty: acc.remainingQty + Number(report.remaining_qty || 0),
        totalVolume: acc.totalVolume + (50 * Number(report.element_volume || 0)),
        plannedAmount: acc.plannedAmount + Number(report.planned_amount || 0),
        plannedVolume: acc.plannedVolume + Number(report.planned_volume || 0),
        actualCasted: acc.actualCasted + Number(report.actual_casted || 0),
        actualVolume: acc.actualVolume + Number(report.actual_volume || 0),
        totalRequired: acc.totalRequired + 50
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
const calculateRFTSummary = (reports: DailyReport[]): RFTSummary => {
    return reports.reduce((acc, report) => {
        if (report.rft && report.actual_casted > 0) {  // Only count if there's actual casting
            if (!acc[report.rft]) {
                acc[report.rft] = { count: 0, volume: 0 };
            }
            acc[report.rft].count += Number(report.actual_casted || 0);
            acc[report.rft].volume += Number(report.actual_volume || 0);
        }
        return acc;
    }, {} as RFTSummary);
};

const generateRFTSummaryHTML = (rftSummary: RFTSummary) => {
    const sources = Object.entries(rftSummary);
    if (sources.length === 0) return '';

    const rows = sources.map(([source, { count, volume }]) => `
        <tr class="border-b border-green-200">
            <td class="p-0.5 text-left font-semibold">${source}</td>
            <td class="p-0.5 text-right font-semibold">${count.toFixed(2)}</td>
            <td class="p-0.5 text-right font-semibold">${volume.toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div class="absolute right-0 bottom-0 border border-green-300 rounded-lg bg-white" style="width: 200px;">
            <table class="w-full text-[7px]">
                <thead>
                    <tr class="bg-green-600">
                        <th colspan="3" class="border-b border-green-400 p-0.5 text-center text-white font-semibold">RFT Summary</th>
                    </tr>
                    <tr class="bg-green-600">
                        <th class="border-b border-green-400 p-0.5 text-left text-white font-semibold">Source</th>
                        <th class="border-b border-green-400 p-0.5 text-right text-white font-semibold">Qty</th>
                        <th class="border-b border-green-400 p-0.5 text-right text-white font-semibold">Vol (m3)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
};
const generateTableHTML = (dailyReports: DailyReport[]) => {
    const totals = calculateTotals(dailyReports);
    const completionPercentage = totals.totalRequired > 0 
        ? (totals.alreadyCasted / totals.totalRequired) * 100 
        : 0;

    const rftSummary = calculateRFTSummary(dailyReports);

    const rows = dailyReports.map((report, index) => `
        <tr class="${getRowColor(report.remarks)}">
            <td class="border-b border-r border-green-200 p-0.5">${String(index + 1).padStart(3, '0')}</td>
            <td class="border-b border-r border-green-200 p-0.5">${report.job_number}</td>
            <td class="border-b border-r border-green-200 p-0.5">${report.table_number}</td>
            <td class="border-b border-r border-green-200 p-0.5">${report.element_code}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.already_casted || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.already_casted_volume || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.remaining_qty || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">50</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.element_volume || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${(Number(report.element_volume || 0) * 50).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${(Number(report.element_volume || 0) * 2.5).toFixed(3)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.planned_amount || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.planned_volume || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.actual_casted || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.actual_volume || 0).toFixed(2)}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-center">${report.mep}</td>
            <td class="border-b border-r border-green-200 p-0.5 text-center">${report.rft || ''}</td>
            <td class="border-b border-green-200 p-0.5">${report.remarks || ''}</td>
        </tr>
    `).join('');

    return `
        <div class="relative overflow-x-auto border border-green-300 rounded-lg">
            <table class="w-full text-[7px] border-collapse">
                <thead>
                    <tr class="bg-green-600">
                        <th class="border-b border-r border-green-400 p-0.5 text-left text-white font-semibold">S/N</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-left text-white font-semibold">Job No</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-left text-white font-semibold">Table No</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-left text-white font-semibold">Element ID</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Already Casted (nos)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Already Volume (m3)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Remaining Qty (nos)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Total Required</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Vol m3</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Total Vol m3</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Weight</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Planned Cast (nos)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Planned Vol (m3)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Actual Cast (nos)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-right text-white font-semibold">Actual Vol (m3)</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-center text-white font-semibold">MEP</th>
                        <th class="border-b border-r border-green-400 p-0.5 text-center text-white font-semibold">RFT Source</th>
                        <th class="border-b border-green-400 p-0.5 text-left text-white font-semibold">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="bg-green-600 font-semibold">
                        <td colspan="4" class="border-r border-green-400 p-0.5 text-right text-white">GRAND TOTAL</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.alreadyCasted.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.alreadyCastedVolume.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.remainingQty.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.totalRequired}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">-</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.totalVolume.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${(totals.totalVolume * 2.5).toFixed(3)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.plannedAmount.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.plannedVolume.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.actualCasted.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.actualVolume.toFixed(2)}</td>
                        <td colspan="3" class="p-0.5 text-center text-white">
                            <div>
                                <div class="font-semibold">Overall Completion</div>
                                <div>${completionPercentage.toFixed(1)}%</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            ${generateRFTSummaryHTML(rftSummary)}
        </div>
    `;
};


const ACT_LOGO = `data:image/jpg;base64,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`;

const generateHTML = (dailyReports: DailyReport[], date: string) => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>ACT Casting Plan - ${date}</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .bg-green-600 { background-color: #059669 !important; }
                    .bg-lime-100 { background-color: #30f230 !important; }
                    .bg-blue-100 { background-color: #5DE2E7 !important; }
                    .bg-rose-50 { background-color: #cfa5af !important; }
                    
                    /* Add any additional styles needed */
                    .logo-container img {
                        width: 48px;
                        height: 48px;
                    }
                </style>
            </head>
            <body class="p-4">
                <div class="container mx-auto">
                    <div class="border-b border-green-600 mb-4 pb-2">
                        <div class="flex items-center justify-between">
                            <div class="flex-shrink-0 logo-container">
                                <img src="${ACT_LOGO}" alt="ACT PRECAST" class="h-12 w-12" />
                            </div>
                            <div class="flex-grow text-center">
                                <h1 class="text-lg font-bold">Integrated Management System</h1>
                                <h2 class="text-base">Daily Production Report</h2>
                            </div>
                        </div>
                        <!-- Rest of the header content -->
                    </div>
                    ${generateTableHTML(dailyReports)}
                </div>
            </body>
        </html>
    `;
};



export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) {
        return authResponse;
    }

    try {
        const { reports, date } = await request.json();
        const htmlContent = generateHTML(reports, date);

        const browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: ['networkidle0', 'domcontentloaded']
        });

        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2
        });

        const pdf = await page.pdf({
            format: 'A3',
            landscape: true,
            printBackground: true,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            },
            preferCSSPageSize: true
        });

        await browser.close();

        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="daily-report-${date}.pdf"`
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' }, 
            { status: 500 }
        );
    }
}