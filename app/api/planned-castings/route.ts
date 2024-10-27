import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'

export async function GET(request: NextRequest) {
    try {
        const authResponse = await authMiddleware(request)
        if (authResponse.status === 401) {
            return authResponse
        }

        const { searchParams } = new URL(request.url)
        const elementId = searchParams.get('elementId')
        const date = searchParams.get('date')

        let query = `
            SELECT pc.*, e.element_id as element_code
            FROM planned_castings pc
            JOIN elements e ON pc.element_id = e.id
        `
        const queryParams = []

        if (elementId) {
            query += ' WHERE pc.element_id = $1'
            queryParams.push(elementId)
        }

        if (date) {
            query += queryParams.length ? ' AND' : ' WHERE'
            query += ' pc.planned_date = $' + (queryParams.length + 1)
            queryParams.push(date)
        }

        const result = await queryWithRetry(query, queryParams)
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error fetching planned castings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResponse = await authMiddleware(request)
        if (authResponse.status === 401) {
            return authResponse
        }

        const { element_id, planned_volume, planned_amount,planned_date } = await request.json()

        const query = `
            INSERT INTO planned_castings (element_id, planned_volume, planned_amount, planned_date)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `
        const result = await queryWithRetry(query, [element_id, planned_volume, planned_amount, planned_date])

        return NextResponse.json({ id: result.rows[0].id })
    } catch (error) {
        console.error('Error creating planned casting:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}