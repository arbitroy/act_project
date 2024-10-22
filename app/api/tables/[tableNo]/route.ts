import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../db'


// GET table by table_number
export async function GET(request: NextRequest, { params }: { params: { table_number: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { table_number } = params

    try {
        const result = await queryWithRetry('SELECT * FROM Tables WHERE table_number = $1', [table_number])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching table:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
