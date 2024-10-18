import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../db'



// GET actual casting by CastingID
export async function GET(request: NextRequest, { params }: { params: { castingId: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { castingId } = params

    try {
        const result = await queryWithRetry('SELECT * FROM ActualCastings WHERE CastingID = $1', [castingId])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Actual casting not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching actual casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}