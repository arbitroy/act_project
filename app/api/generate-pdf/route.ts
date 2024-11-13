import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import { ACT_LOGO } from './ACT_LOGO';
import { randomBytes } from 'crypto';


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
    required_amount: number;
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
        totalVolume: acc.totalVolume + Number(report.element_volume || 0),
        totalRequiredVolume: acc.totalRequiredVolume + (Number(report.required_amount || 0) * Number(report.element_volume || 0)),
        plannedAmount: acc.plannedAmount + Number(report.planned_amount || 0),
        plannedVolume: acc.plannedVolume + Number(report.planned_volume || 0),
        actualCasted: acc.actualCasted + Number(report.actual_casted || 0),
        actualVolume: acc.actualVolume + Number(report.actual_volume || 0),
        totalRequired: acc.totalRequired + Number(report.required_amount || 0)
    }), {
        alreadyCasted: 0,
        alreadyCastedVolume: 0,
        remainingQty: 0,
        totalVolume: 0,
        totalRequiredVolume: 0,
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
        <div class="flex justify-end mt-4 mr-56">
            <div class="border border-green-300 rounded-lg bg-white" style="width: 200px;">
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
        <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.required_amount || 0)}</td>
        <td class="border-b border-r border-green-200 p-0.5 text-right">${Number(report.element_volume || 0).toFixed(2)}</td>
        <td class="border-b border-r border-green-200 p-0.5 text-right">${(Number(report.element_volume || 0) * Number(report.required_amount || 0)).toFixed(2)}</td>
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
        <div class="overflow-x-auto border border-green-300 rounded-lg">
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
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.totalVolume.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${totals.totalRequiredVolume.toFixed(2)}</td>
                        <td class="border-r border-green-400 p-0.5 text-right text-white">${(totals.totalVolume * 2.5).toFixed(2)}</td>
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

const generateUniqueId = () => {
    // Generate a 4-character hex string
    return randomBytes(2).toString('hex');
};

export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) {
        return authResponse;
    }

    let browser = null;

    try {
        const { reports, date } = await request.json();
        const htmlContent = generateHTML(reports, date);
        const uniqueId = generateUniqueId();

        // Initialize Chrome with the new package
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Set longer timeout for content loading
        await page.setDefaultNavigationTimeout(30000);

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

        return new NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="daily-report-${date}-${uniqueId}.pdf"`
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}