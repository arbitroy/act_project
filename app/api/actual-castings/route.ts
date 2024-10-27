import { authMiddleware } from '@/middleware/auth'
import { NextRequest, NextResponse } from 'next/server'
import { queryWithRetry } from '../db'

// GET all actual castings
export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const result = await queryWithRetry('SELECT * FROM actualcastings')
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching actual castings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST new actual casting
export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { daily_report_id, casted_amount, casted_volume, remarks, updated_by } = await request.json()
        const result = await queryWithRetry(
            'INSERT INTO actualcastings (daily_report_id, casted_amount, casted_volume, remarks, updated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [daily_report_id, casted_amount, casted_volume, remarks, updated_by]
        )
        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error('Error creating actual casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT (update) actual casting
export async function PUT(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { id, casted_amount, casted_volume, remarks, updated_by } = await request.json()
        const result = await queryWithRetry(
            'UPDATE actualcastings SET casted_amount = $2, remarks = $3, updated_by = $4, casted_volume = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id, casted_amount, remarks, updated_by, casted_volume]
        )
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Actual casting not found' }, { status: 404 })
        }
        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating actual casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE actual casting
export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { id } = await request.json()
        const result = await queryWithRetry('DELETE FROM actualcastings WHERE id = $1 RETURNING *', [id])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Actual casting not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Actual casting deleted successfully' })
    } catch (error) {
        console.error('Error deleting actual casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}