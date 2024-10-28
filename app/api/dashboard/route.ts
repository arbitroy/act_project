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
        // Fetch daily casting data
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

        // Fetch element completion status
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

        // Fetch monthly progress data
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
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}