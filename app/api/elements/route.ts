import { authMiddleware } from '@/middleware/auth'
import { NextRequest, NextResponse } from 'next/server'
import { queryWithRetry } from '../db'


// GET all elements
export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const searchParams = new URL(request.url).searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    try {
        const query = includeInactive 
            ? 'SELECT *, status FROM Elements ORDER BY element_id'
            : 'SELECT *, status FROM Elements WHERE status = $1 ORDER BY element_id'
        const params = includeInactive ? [] : ['active']
        
        const result = await queryWithRetry(query, params)
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching elements:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST new element
export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { element_id, volume, weight } = await request.json()
        const result = await queryWithRetry(
            'INSERT INTO Elements (element_id, Volume, Weight) VALUES ($1, $2, $3) RETURNING *',
            [element_id, volume, weight]
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
        const { element_id, volume, weight } = await request.json()
        const result = await queryWithRetry(
            'UPDATE Elements SET Volume = $2, Weight = $3 WHERE element_id = $1 RETURNING *',
            [element_id, volume, weight]
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