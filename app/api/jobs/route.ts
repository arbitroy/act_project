import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'

// GET all jobs
export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const result = await queryWithRetry('SELECT * FROM Jobs')
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST new job
export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { jobno, description } = await request.json()
        
        // Validate input
        if (!jobno || jobno.trim() === '') {
            return NextResponse.json({ error: 'Job number is required' }, { status: 400 })
        }

        const result = await queryWithRetry(
            'INSERT INTO Jobs (JobNo, Description) VALUES ($1, $2) RETURNING *',
            [jobno, description]
        )
        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error('Error creating job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT (update) job
export async function PUT(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const { jobNo, description } = await request.json()
        const result = await queryWithRetry(
            'UPDATE Jobs SET Description = $2 WHERE JobNo = $1 RETURNING *',
            [jobNo, description]
        )
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }
        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE job
export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const { jobNo } = await request.json()
        const result = await queryWithRetry('DELETE FROM Jobs WHERE JobNo = $1 RETURNING *', [jobNo])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Job deleted successfully' })
    } catch (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}