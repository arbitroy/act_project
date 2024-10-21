import { authMiddleware } from '@/middleware/auth'
import { NextRequest, NextResponse } from 'next/server'
import { queryWithRetry } from '../db'

// GET all daily reports
export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    const page = parseInt(request.page as unknown as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        const countResult = await queryWithRetry('SELECT COUNT(*) FROM DailyReports');
        const totalReports = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalReports / limit);

        const result = await queryWithRetry(`
          SELECT dr.id, dr.date, j.job_number, t.table_number, e.element_id,
                 dr.already_casted, dr.remaining_quantity, dr.planned_to_cast, dr.planned_volume
          FROM DailyReports dr
          JOIN Jobs j ON dr.job_id = j.id
          JOIN Tables t ON dr.table_id = t.id
          JOIN Elements e ON dr.element_id = e.id
          ORDER BY dr.date DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]);

        NextResponse.json({
            reports: result.rows,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error(err);
        NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST new daily report
export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { date, userId, jobId, tableId, elementId, alreadyCasted, remainingQuantity, plannedToCast, plannedVolume, mep, remarks } = await request.json()
        const result = await queryWithRetry(
            'INSERT INTO DailyReports (date, user_id, job_id, table_id, element_id, already_casted, remaining_quantity, planned_to_cast, planned_volume, mep, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
            [date, userId, jobId, tableId, elementId, alreadyCasted, remainingQuantity, plannedToCast, plannedVolume, mep, remarks]
        )
        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error('Error creating daily report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT (update) daily report
export async function PUT(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { reportId, date, jobNo, tableNo, elementId, alreadyCasted, remainingQuantity, plannedToCast, plannedVolume, mep, remarks } = await request.json()
        const result = await queryWithRetry(
            'UPDATE DailyReports SET Date = $2, JobNo = $3, TableNo = $4, ElementID = $5, AlreadyCasted = $6, RemainingQuantity = $7, PlannedToCast = $8, PlannedVolume = $9, MEP = $10, Remarks = $11 WHERE ReportID = $1 RETURNING *',
            [reportId, date, jobNo, tableNo, elementId, alreadyCasted, remainingQuantity, plannedToCast, plannedVolume, mep, remarks]
        )
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Daily report not found' }, { status: 404 })
        }
        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating daily report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE daily report
export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { reportId } = await request.json()
        const result = await queryWithRetry('DELETE FROM DailyReports WHERE ReportID = $1 RETURNING *', [reportId])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Daily report not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Daily report deleted successfully' })
    } catch (error) {
        console.error('Error deleting daily report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}