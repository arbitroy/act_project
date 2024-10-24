import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../../db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { planned_volume, planned_weight, planned_casting_date } = await request.json()
    const { id } = params

    try {
        const result = await queryWithRetry(
            'UPDATE elements SET planned_volume = $1, planned_weight = $2, planned_casting_date = $3 WHERE id = $4 RETURNING *',
            [planned_volume, planned_weight, planned_casting_date, id]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating element plan:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}