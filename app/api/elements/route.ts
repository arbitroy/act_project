import { authMiddleware } from '@/middleware/auth'
import { NextRequest, NextResponse } from 'next/server'
import { queryWithRetry } from '../db'


// GET all elements
export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const result = await queryWithRetry('SELECT * FROM Elements')
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
        const { elementId, volume, weight } = await request.json()
        const result = await queryWithRetry(
            'INSERT INTO Elements (element_id, Volume, Weight) VALUES ($1, $2, $3) RETURNING *',
            [elementId, volume, weight]
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
        const { elementId, volume, weight } = await request.json()
        const result = await queryWithRetry(
            'UPDATE Elements SET Volume = $2, Weight = $3 WHERE element_id = $1 RETURNING *',
            [elementId, volume, weight]
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
    if (authResponse.status === 401) {
        return authResponse
    }
    try {
        const { elementId } = await request.json()
        const result = await queryWithRetry('DELETE FROM Elements WHERE Element_ID = $1 RETURNING *', [elementId])
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }
        return NextResponse.json({ message: 'Element deleted successfully' })
    } catch (error) {
        console.error('Error deleting element:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}