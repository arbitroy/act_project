import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../db'



// GET job by job_number
export async function GET(request: NextRequest, { params }: { params: { job_number: string } }) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { job_number } = params

    try {
        const result = await queryWithRetry('SELECT * FROM Jobs WHERE job_number = $1', [job_number])

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}