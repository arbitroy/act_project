import { authMiddleware } from '@/middleware/auth'
import { NextRequest, NextResponse } from 'next/server'
import { queryWithRetry } from '../db'
import { QueryParams } from '../types'


export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const searchParams = new URL(request.url).searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const projectId = searchParams.get('projectId')

    try {
        let query: string
        let params: QueryParams[] = []

        if (projectId) {
            // If projectId is provided, get elements for that project
            query = includeInactive 
                ? `
                    SELECT e.*, p.name as project_name 
                    FROM Elements e
                    LEFT JOIN projects p ON e.project_id = p.id
                    WHERE e.project_id = $1
                    ORDER BY e.element_id
                `
                : `
                    SELECT e.*, p.name as project_name 
                    FROM Elements e
                    LEFT JOIN projects p ON e.project_id = p.id
                    WHERE e.project_id = $1 AND e.status = $2
                    ORDER BY e.element_id
                `
            params = includeInactive ? [projectId] : [projectId, 'active']
        } else {
            // If no projectId, get all elements
            query = includeInactive
                ? `
                    SELECT e.*, p.name as project_name 
                    FROM Elements e
                    LEFT JOIN projects p ON e.project_id = p.id
                    ORDER BY e.element_id
                `
                : `
                    SELECT e.*, p.name as project_name 
                    FROM Elements e
                    LEFT JOIN projects p ON e.project_id = p.id
                    WHERE e.status = $1
                    ORDER BY e.element_id
                `
            params = includeInactive ? [] : ['active']
        }

        const result = await queryWithRetry(query, params)
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching elements:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { element_id, volume, weight, required_amount, project_id } = await request.json()
        
        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const result = await queryWithRetry(
            'INSERT INTO Elements (element_id, volume, weight, required_amount, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [element_id, volume, weight, required_amount, project_id]
        )
        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error('Error creating element:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT (update) element
export async function PUT(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { element_id, volume, weight, required_amount } = await request.json()
        const result = await queryWithRetry(
            'UPDATE Elements SET volume = $2, weight = $3, required_amount = $4 WHERE element_id = $1 RETURNING *',
            [element_id, volume, weight, required_amount]
        )
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }
        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error('Error updating element:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE element
export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if ('error' in authResponse) {
        return authResponse as NextResponse
    }

    try {
        const { element_id } = await request.json()
        const result = await queryWithRetry(`
            UPDATE Elements 
            SET status = 'inactive',
                deleted_at = CURRENT_TIMESTAMP
            WHERE element_id = $1 
            RETURNING *
        `, [element_id])
        
        if (result.rowCount === 0) {
            return NextResponse.json({ 
                error: 'Element not found',
                message: 'The specified element does not exist.'
            }, { status: 404 })
        }
        
        return NextResponse.json({
            message: 'Element deactivated successfully',
            deactivatedElement: result.rows[0]
        })

    } catch (error) {
        console.error('Error deactivating element:', error)
        return NextResponse.json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deactivating the element.'
        }, { status: 500 })
    }
}

// Add new endpoint to restore deleted elements
export async function PATCH(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        const { element_id } = await request.json()
        
        const result = await queryWithRetry(`
            UPDATE Elements 
            SET status = 'active',
                deleted_at = NULL,
                deleted_by = NULL
            WHERE element_id = $1 
            RETURNING *
        `, [element_id])
        
        if (result.rowCount === 0) {
            return NextResponse.json({ 
                error: 'Element not found',
                message: 'The specified element does not exist.'
            }, { status: 404 })
        }
        
        return NextResponse.json({
            message: 'Element restored successfully',
            restoredElement: result.rows[0]
        })

    } catch (error) {
        console.error('Error restoring element:', error)
        return NextResponse.json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while restoring the element.'
        }, { status: 500 })
    }
}