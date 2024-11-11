import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { id } = params
    const { casted_amount, casting_time, rft } = await request.json()

    try {
        // First, update the daily report status and rft
        await queryWithRetry(
            'UPDATE dailyreports SET status = $1, rft = $2 WHERE id = $3',
            ['completed', rft, id]
        )

        // Then, create an entry in the actualcastings table
        const result = await queryWithRetry(
            'INSERT INTO actualcastings (daily_report_id, casted_amount, date, casting_time, element_id) SELECT $1, $2, date, $3, element_id FROM dailyreports WHERE id = $1 RETURNING *',
            [id, casted_amount, casting_time]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Daily report not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating daily report with actual casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}