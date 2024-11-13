import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'
import { DashboardData } from '@/types/dashboard'

export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    try {
        // Existing queries remain the same
        const dailyCastingQuery = `
            SELECT 
                date,
                SUM(pc.planned_amount) as planned_amount,
                SUM(COALESCE(ac.casted_amount, 0)) as actual_amount
            FROM dailyreports dr
            LEFT JOIN planned_castings pc ON dr.element_id = pc.element_id AND dr.date = pc.planned_date
            LEFT JOIN actualcastings ac ON dr.id = ac.daily_report_id
            GROUP BY date
            ORDER BY date DESC
            LIMIT 7
        `
        const dailyCastingResult = await queryWithRetry(dailyCastingQuery)

        const elementCompletionQuery = `
            SELECT 
                CASE 
                    WHEN dr.status = 'completed' THEN 'Completed'
                    WHEN dr.status = 'in_progress' THEN 'In Progress'
                    ELSE 'Pending'
                END as status,
                COUNT(*) as value
            FROM dailyreports dr
            GROUP BY dr.status
        `
        const elementCompletionResult = await queryWithRetry(elementCompletionQuery)

        const monthlyProgressQuery = `
            SELECT 
                TO_CHAR(date_trunc('month', dr.date), 'Mon') as month,
                SUM(pc.planned_amount) as planned,
                SUM(COALESCE(ac.casted_amount, 0)) as actual
            FROM dailyreports dr
            LEFT JOIN planned_castings pc ON dr.element_id = pc.element_id AND dr.date = pc.planned_date
            LEFT JOIN actualcastings ac ON dr.id = ac.daily_report_id
            GROUP BY date_trunc('month', dr.date)
            ORDER BY date_trunc('month', dr.date) DESC
            LIMIT 6
        `
        const monthlyProgressResult = await queryWithRetry(monthlyProgressQuery)

        // Query for daily casting amounts
        const dailyCastingAmountQuery = `
            SELECT 
                dr.date,
                SUM(ac.casted_amount) as amount
            FROM dailyreports dr
            JOIN actualcastings ac ON dr.id = ac.daily_report_id
            WHERE ac.casted_amount > 0
            GROUP BY dr.date
            ORDER BY dr.date ASC
            LIMIT 30
        `
        const dailyCastingAmountResult = await queryWithRetry(dailyCastingAmountQuery)

        // Query for cumulative casting volumes
        const cumulativeCastingVolumeQuery = `
            WITH daily_volumes AS (
                SELECT 
                    dr.date,
                    SUM(ac.casted_volume) as daily_volume
                FROM dailyreports dr
                JOIN actualcastings ac ON dr.id = ac.daily_report_id
                WHERE ac.casted_volume > 0
                GROUP BY dr.date
                ORDER BY dr.date ASC
            )
            SELECT 
                date,
                daily_volume as volume,
                SUM(daily_volume) OVER (ORDER BY date) as cumulative_volume
            FROM daily_volumes
            LIMIT 30
        `
        const cumulativeCastingVolumeResult = await queryWithRetry(cumulativeCastingVolumeQuery)

        const dashboardData: DashboardData = {
            dailyCastingData: dailyCastingResult.rows.map(row => ({
                date: row.date,
                planned_amount: Number(row.planned_amount) || 0,
                actual_amount: Number(row.actual_amount) || 0,
            })),
            elementCompletionData: elementCompletionResult.rows.map(row => ({
                status: row.status as 'Completed' | 'In Progress' | 'Pending',
                value: Number(row.value),
            })),
            monthlyProgressData: monthlyProgressResult.rows.reverse().map(row => ({
                month: row.month,
                planned: Number(row.planned) || 0,
                actual: Number(row.actual) || 0,
            })),
            dailyCastingAmountData: dailyCastingAmountResult.rows.map(row => ({
                date: row.date,
                amount: Number(row.amount) || 0,
            })),
            dailyCastingVolumeData: cumulativeCastingVolumeResult.rows.map(row => ({
                date: row.date,
                volume: Number(row.volume) || 0,
                cumulativeVolume: Number(row.cumulative_volume) || 0,
            })),
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}