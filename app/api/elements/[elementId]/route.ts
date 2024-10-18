import { NextResponse, NextRequest } from 'next/server'
import { Pool } from 'pg'
import { authMiddleware } from '@/middleware/auth'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// GET element by ElementID
export async function GET(request: NextRequest, { params }: { params: { elementId: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { elementId } = params

    try {
        const result = await pool.query('SELECT * FROM Elements WHERE ElementID = $1', [elementId])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching element:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}