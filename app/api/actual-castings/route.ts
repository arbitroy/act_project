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
        const result = await queryWithRetry('SELECT * FROM ActualCastings')
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
        const { reportId, actualCasted, updatedBy } = await request.json()
        const result = await queryWithRetry(
            'INSERT INTO ActualCastings (ReportID, ActualCasted, UpdatedBy) VALUES ($1, $2, $3) RETURNING *',
            [reportId, actualCasted, updatedBy]
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
        const { castingId, actualCasted, updatedBy } = await request.json()
        const result = await queryWithRetry(
            'UPDATE ActualCastings SET ActualCasted = $2, UpdatedBy = $3, UpdatedAt = CURRENT_TIMESTAMP WHERE CastingID = $1 RETURNING *',
            [castingId, actualCasted, updatedBy]
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
        const { castingId } = await request.json()
        const result = await queryWithRetry('DELETE FROM ActualCastings WHERE CastingID = $1 RETURNING *', [castingId])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Actual casting not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Actual casting deleted successfully' })
    } catch (error) {
        console.error('Error deleting actual casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}