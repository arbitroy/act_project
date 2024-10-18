import { NextResponse, NextRequest } from 'next/server'
import { Pool } from 'pg'
import { authMiddleware } from '@/middleware/auth'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// GET table by TableNo
export async function GET(request: NextRequest, { params }: { params: { tableNo: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { tableNo } = params

    try {
        const result = await pool.query('SELECT * FROM Tables WHERE TableNo = $1', [tableNo])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching table:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}