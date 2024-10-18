import { NextResponse, NextRequest } from 'next/server'
import { Pool } from 'pg'
import { authMiddleware } from '@/middleware/auth'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// GET job by JobNo
export async function GET(request: NextRequest, { params }: { params: { jobNo: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { jobNo } = params

    try {
        const result = await pool.query('SELECT * FROM Jobs WHERE JobNo = $1', [jobNo])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}