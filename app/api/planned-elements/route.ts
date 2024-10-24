import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'

export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { searchParams } = new URL(request.url)
    const elementId = searchParams.get('element_id')

    if (!elementId) {
        return NextResponse.json({ error: 'Element ID is required' }, { status: 400 })
    }

    try {
        const result = await queryWithRetry(
            'SELECT id, element_id, planned_volume, planned_weight, planned_casting_date FROM elements WHERE element_id = $1',
            [elementId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching planned element:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}