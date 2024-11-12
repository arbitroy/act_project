import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'

export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const searchParams = new URL(request.url).searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    try {
        const result = await queryWithRetry(
            'SELECT * FROM Jobs WHERE project_id = $1',
            [projectId]
        )
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { job_number, description, project_id } = await request.json()
        
        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const result = await queryWithRetry(
            'INSERT INTO Jobs (job_number, description, project_id) VALUES ($1, $2, $3) RETURNING *',
            [job_number, description, project_id]
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
        const { job_number, description } = await request.json()
        const result = await queryWithRetry(
            'UPDATE Jobs SET Description = $2 WHERE job_number = $1 RETURNING *',
            [job_number, description]
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
        const { job_number } = await request.json()
        const result = await queryWithRetry('DELETE FROM Jobs WHERE job_number = $1 RETURNING *', [job_number])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Job deleted successfully' })
    } catch (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}