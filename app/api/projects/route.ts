import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'


export async function GET(
    request: NextRequest,
    { params }: {  params: { projectId: string } }
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


export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) {
        return authResponse;
    }

    const { project_number, name, description, created_by } = await request.json();

    try {
        const result = await queryWithRetry(
            `INSERT INTO projects (
                project_number, 
                name, 
                description, 
                created_by,
                status
            ) VALUES ($1, $2, $3, $4, $5) 
            RETURNING *, 
                0 as jobs_count, 
                0 as tables_count, 
                0 as elements_count`,
            [project_number, name, description, created_by, 'active']
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        console.error('Error creating project:', error);
        if (error.code === '23505') { // Unique violation
            return NextResponse.json(
                { error: 'Project number already exists' }, 
                { status: 400 }
            );
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const projectId = params.id
        const { name, description, updated_by } = await request.json()

        const result = await queryWithRetry(`
            UPDATE projects 
            SET name = $1,
                description = $2,
                updated_by = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND status = 'active'
            RETURNING *
        `, [name, description, updated_by, projectId])

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) {
        return authResponse;
    }

    const { id, deleted_by } = await request.json();

    try {
        // Soft delete by updating status
        const result = await queryWithRetry(
            `UPDATE projects 
            SET status = 'inactive',
                updated_by = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND status = 'active'
            RETURNING *`,
            [deleted_by, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Project not found or already inactive' }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}