import { authMiddleware } from '@/middleware/auth'
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// GET all daily reports
export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const result = await pool.query('SELECT * FROM DailyReports')
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching daily reports:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST new daily report
export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { date, jobNo, tableNo, elementId, alreadyCasted, remainingQuantity, plannedToCast, plannedVolume, mep, remarks, createdBy } = await request.json()
        const result = await pool.query(
            'INSERT INTO DailyReports (Date, JobNo, TableNo, ElementID, AlreadyCasted, RemainingQuantity, PlannedToCast, PlannedVolume, MEP, Remarks, CreatedBy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [date, jobNo, tableNo, elementId, alreadyCasted, remainingQuantity, plannedToCast, plannedVolume, mep, remarks, createdBy]
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
        const result = await pool.query(
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
        const result = await pool.query('DELETE FROM DailyReports WHERE ReportID = $1 RETURNING *', [reportId])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Daily report not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Daily report deleted successfully' })
    } catch (error) {
        console.error('Error deleting daily report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}