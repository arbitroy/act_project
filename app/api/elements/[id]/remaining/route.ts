import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../../../db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResponse = await authMiddleware(request)
        if (authResponse.status === 401) {
            return authResponse
        }

        const elementId = params.id

        // Fetch the element's total volume and weight
        const elementQuery = `
            SELECT volume, weight
            FROM elements
            WHERE id = $1
        `
        const elementResult = await queryWithRetry(elementQuery, [elementId])

        if (elementResult.rows.length === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }

        const { volume: totalVolume, weight: totalWeight } = elementResult.rows[0]

        // Calculate the sum of actual castings
        const castingsQuery = `
            SELECT SUM(casted_amount) as total_casted
            FROM actualcastings
            WHERE element_id = $1
        `
        const castingsResult = await queryWithRetry(castingsQuery, [elementId])

        const totalCasted = castingsResult.rows[0].total_casted || 0

        // Calculate remaining volume and weight
        const remainingVolume = Math.max(0, parseFloat(totalVolume) - totalCasted)
        const remainingWeight = Math.max(0, parseFloat(totalWeight) - totalCasted)

        // Calculate completion percentage
        const completionPercentage = Math.min(100, (totalCasted / parseFloat(totalVolume)) * 100)

        return NextResponse.json({
            elementId,
            totalVolume: parseFloat(totalVolume),
            totalWeight: parseFloat(totalWeight),
            totalCasted,
            remainingVolume,
            remainingWeight,
            completionPercentage: parseFloat(completionPercentage.toFixed(2))
        })
    } catch (error) {
        console.error('Error calculating remaining quantity:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}