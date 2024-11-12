import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../db'

export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string } }  
) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const projectId = params.projectId 

        const result = await queryWithRetry(`
            SELECT 
                p.*,
                u1.username as created_by_user,
                u2.username as updated_by_user
            FROM projects p
            LEFT JOIN users u1 ON p.created_by = u1.id
            LEFT JOIN users u2 ON p.updated_by = u2.id
            WHERE p.id = $1 AND p.status = 'active'
        `, [projectId])

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}