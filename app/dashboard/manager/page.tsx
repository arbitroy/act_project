'use client'

import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from "recharts"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, AlertCircle } from 'lucide-react'

// Strongly typed color palette
const colors = {
    primary: '#15803d',
    secondary: '#22c55e',
    tertiary: '#86efac',
    background: '#f0fdf4',
    border: '#BBF7D0',
} as const

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'] as const

// Type definitions for dashboard data
interface DailyCastingEntry {
    date: string;
    planned_amount: number;
    actual_amount: number;
}

interface ElementCompletionEntry {
    status: string;
    value: number;
}

interface MonthlyProgressEntry {
    month: string;
    planned: number;
    actual: number;
}

interface DailyCastingAmount {
    date: string;
    amount: number;
}

interface DailyCastingVolume {
    date: string;
    volume: number;
    cumulativeVolume: number;
}

interface DashboardData {
    dailyCastingData: DailyCastingEntry[];
    elementCompletionData: ElementCompletionEntry[];
    monthlyProgressData: MonthlyProgressEntry[];
    dailyCastingAmountData: DailyCastingAmount[];
    dailyCastingVolumeData: DailyCastingVolume[];
}



interface ChartCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}



const ChartCard: React.FC<ChartCardProps> = ({ title, description, children }) => (
    <Card className="border-green-200 shadow-lg">
        <CardHeader className="border-b border-green-100">
            <CardTitle className="text-black">{title}</CardTitle>
            <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
            {children}
        </CardContent>
    </Card>
)



export default function ManagerDashboard() {
    const { user, loading, error } = useAuth()
    const router = useRouter()
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [dataLoading, setDataLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (user.role !== 'manager') {
                router.push('/dashboard')
            } else {
                void fetchDashboardData()
            }
        }
    }, [user, loading, router])

    const fetchDashboardData = async (): Promise<void> => {
        try {
            const response = await fetch('/api/dashboard')
            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
            }
            const data = await response.json() as DashboardData
            setDashboardData(data)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            console.error('Error fetching dashboard data:', errorMessage)
            setFetchError(errorMessage)
        } finally {
            setDataLoading(false)
        }
    }

    const renderDailyCastingChart = (data: DailyCastingEntry[]) => (
        <ChartContainer className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        stroke="#000000"
                        tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="#000000" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="planned_amount" fill={colors.primary} name="Planned Amount" />
                    <Bar dataKey="actual_amount" fill={colors.secondary} name="Actual Amount" />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )

    const renderElementCompletionChart = (data: ElementCompletionEntry[]) => (
        <ChartContainer className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="status"
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                        }
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )

    const renderDailyCastingAmountBarChart = (data: DailyCastingAmount[]) => (
        <ChartContainer className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        stroke="#000000"
                        tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="#000000" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill={colors.primary} name="Daily Casting Amount" />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )

    const renderDailyCastingVolumeBarChart = (data: DailyCastingVolume[]) => {
        // Calculate cumulative amounts for the bar chart
        const cumulativeData = data.map((entry, index) => ({
            ...entry,
            cumulativeVolume: data.slice(0, index + 1).reduce((sum, item) => sum + item.volume, 0)
        }))

        return (
            <ChartContainer className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#000000"
                            tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#000000" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="cumulativeVolume" fill={colors.secondary} name="Cumulative Volume" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        )
    }

    const renderDailyCastingAmountLineChart = (data: DailyCastingAmount[]) => {
        // Calculate cumulative amounts for the line chart
        const cumulativeData = data.map((entry, index) => ({
            ...entry,
            cumulativeAmount: data.slice(0, index + 1).reduce((sum, item) => sum + item.amount, 0)
        }))

        return (
            <ChartContainer className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey="cumulativeAmount"
                            stroke={colors.primary}
                            name="Cumulative Amount"
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        )
    }

    const renderDailyCastingVolumeLineChart = (data: DailyCastingVolume[]) => (
        <ChartContainer className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="cumulativeVolume"
                        stroke={colors.secondary}
                        name="Cumulative Volume"
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    )

    const renderMonthlyProgressChart = (data: MonthlyProgressEntry[]) => (
        <ChartContainer className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="planned"
                        stroke={colors.primary}
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke={colors.secondary}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    )

    const calculateCompletionRate = (data: ElementCompletionEntry[]): string => {
        const totalElements = data.reduce((acc, curr) => acc + curr.value, 0)
        const completedElements = data.find(item => item.status === 'Completed')?.value || 0
        return ((completedElements / totalElements) * 100).toFixed(1)
    }

    if (loading || dataLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-green-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
                    <p className="mt-2 text-black font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error || fetchError) {
        return (
            <div className="flex h-screen items-center justify-center bg-green-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-red-600 text-xl mb-2">Error</div>
                    <p className="text-black">{error?.message || fetchError}</p>
                </div>
            </div>
        )
    }

    if (!user || !dashboardData) {
        return null
    }

    return (
        <Layout>
            <div className="min-h-screen bg-green-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="mb-8 border-green-200 shadow-lg">
                        <CardHeader className="border-b border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-3xl font-bold text-black">
                                        Manager Dashboard
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 text-lg mt-2">
                                        Welcome back, {user.username}!
                                    </CardDescription>
                                </div>
                                <div className="bg-green-100 rounded-full px-4 py-2 text-black font-medium">
                                    Manager View
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ChartCard
                            title="Daily Casting Progress"
                            description="Planned vs actual casting amounts"
                        >
                            {renderDailyCastingChart(dashboardData.dailyCastingData)}
                        </ChartCard>

                        <ChartCard
                            title="Element Completion"
                            description="Overall casting progress"
                        >
                            {renderElementCompletionChart(dashboardData.elementCompletionData)}
                        </ChartCard>

                        <ChartCard
                            title="Monthly Progress"
                            description="Planned vs Actual progress over months"
                        >
                            {renderMonthlyProgressChart(dashboardData.monthlyProgressData)}
                        </ChartCard>

                        <Card className="border-green-200 shadow-lg">
                            <CardHeader className="border-b border-green-100">
                                <CardTitle className="text-black">Key Metrics</CardTitle>
                                <CardDescription className="text-gray-600">
                                    Summary of important statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Elements</p>
                                        <p className="text-2xl font-bold text-black">
                                            {dashboardData.elementCompletionData.reduce(
                                                (acc, curr) => acc + curr.value,
                                                0
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Completion Rate</p>
                                        <p className="text-2xl font-bold text-black">
                                            {calculateCompletionRate(dashboardData.elementCompletionData)}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <ChartCard
                            title="Number of Panels Cast"
                            description="Daily panels casting by day"
                        >
                            {renderDailyCastingAmountBarChart(dashboardData.dailyCastingAmountData)}
                        </ChartCard>

                        <ChartCard
                            title="Cumulative Panels Casting"
                            description="Total accumulated panels casting over time"
                        >
                            {renderDailyCastingAmountLineChart(dashboardData.dailyCastingAmountData)}
                        </ChartCard>

                        <ChartCard
                            title="Total Concrete Cast"
                            description="Total accumulated concrete casting over time"
                        >
                            {renderDailyCastingVolumeBarChart(dashboardData.dailyCastingVolumeData)}
                        </ChartCard>

                        <ChartCard
                            title="Cumulative Concrete Cast Trend"
                            description="Trend of total accumulated concrete casting"
                        >
                            {renderDailyCastingVolumeLineChart(dashboardData.dailyCastingVolumeData)}
                        </ChartCard>
                    </div>
                </div>
            </div>
        </Layout>
    )
}