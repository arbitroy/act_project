import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'
import { QueryParams } from '../types'



export async function GET(request: NextRequest) {

    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const searchParams = new URL(request.url).searchParams
    const projectId = searchParams.get('projectId')

    try {
        let query: string
        let params: QueryParams[] = []

        if (projectId) {
            // If projectId is provided, get tables for that project
            query = `
                SELECT t.*, p.name as project_name 
                FROM Tables t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.project_id = $1
                ORDER BY t.table_number
            `
            params = [projectId]
        } else {
            // If no projectId, get all tables
            query = `
                SELECT t.*, p.name as project_name 
                FROM Tables t
                LEFT JOIN projects p ON t.project_id = p.id
                ORDER BY t.table_number
            `
        }

        const result = await queryWithRetry(query, params)
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching tables:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const { table_number, description, project_id } = await request.json()

        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const result = await queryWithRetry(
            'INSERT INTO Tables (table_number, description, project_id) VALUES ($1, $2, $3) RETURNING *',
            [table_number, description, project_id]
        )
        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error('Error creating table:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT (update) table
export async function PUT(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const { table_number, description } = await request.json()
        const result = await queryWithRetry(
            'UPDATE Tables SET Description = $2 WHERE table_number = $1 RETURNING *',
            [table_number, description]
        )
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }
        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating table:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE table
export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const { table_number } = await request.json()
        const result = await queryWithRetry('DELETE FROM Tables WHERE table_number = $1 RETURNING *', [table_number])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Table deleted successfully' })
    } catch (error) {
        console.error('Error deleting table:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}