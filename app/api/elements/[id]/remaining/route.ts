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

        // Updated to include required_amount
        const elementQuery = `
            SELECT volume, required_amount
            FROM elements
            WHERE id = $1
        `
        const elementResult = await queryWithRetry(elementQuery, [elementId])

        if (elementResult.rows.length === 0) {
            return NextResponse.json({ error: 'Element not found' }, { status: 404 })
        }

        const { volume: totalVolume, required_amount: totalRequiredAmount } = elementResult.rows[0]

        // Rest of the queries remain the same
        const plannedQuery = `
            SELECT 
                COALESCE(SUM(planned_volume), 0) as total_planned_volume,
                COALESCE(SUM(planned_amount), 0) as total_planned_amount
            FROM planned_castings
            WHERE element_id = $1
        `
        const plannedResult = await queryWithRetry(plannedQuery, [elementId])
        const { 
            total_planned_volume: totalPlannedVolume,
            total_planned_amount: totalPlannedAmount 
        } = plannedResult.rows[0]

        const castingsQuery = `
            SELECT 
                COALESCE(SUM(ac.casted_volume), 0) as total_casted_volume,
                COALESCE(SUM(ac.casted_amount), 0) as total_casted_amount
            FROM actualcastings ac
            JOIN dailyreports dr ON ac.daily_report_id = dr.id
            WHERE dr.element_id = $1
        `
        const castingsResult = await queryWithRetry(castingsQuery, [elementId])
        
        const { 
            total_casted_volume: totalCastedVolume,
            total_casted_amount: totalCastedAmount 
        } = castingsResult.rows[0]

        // Calculate remaining volumes and amounts
        const remainingVolume = Math.max(0, Number(totalPlannedVolume) - Number(totalCastedVolume))
        const remainingAmount = Math.max(0, Number(totalPlannedAmount) - Number(totalCastedAmount))

        // Calculate completion percentages
        const completionPercentageVolume = Number(totalPlannedVolume) > 0
            ? Math.min(100, (Number(totalCastedVolume) / Number(totalPlannedVolume)) * 100)
            : 0

        const completionPercentageAmount = Number(totalPlannedAmount) > 0
            ? Math.min(100, (Number(totalCastedAmount) / Number(totalPlannedAmount)) * 100)
            : 0

        return NextResponse.json({
            elementId,
            totalVolume: Number(totalVolume),
            totalRequiredAmount: Number(totalRequiredAmount), // Added this field
            totalPlannedVolume: Number(totalPlannedVolume),
            totalCastedVolume: Number(totalCastedVolume),
            remainingVolume,
            completionPercentageVolume: Number(completionPercentageVolume.toFixed(2)),
            totalPlannedAmount: Number(totalPlannedAmount),
            totalCastedAmount: Number(totalCastedAmount),
            remainingAmount,
            completionPercentageAmount: Number(completionPercentageAmount.toFixed(2))
        })
    } catch (error) {
        console.error('Error calculating remaining quantity:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}