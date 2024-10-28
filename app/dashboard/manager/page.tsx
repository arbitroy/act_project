'use client'

import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from "recharts"
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

// Mock data remains the same
const dailyCastingData = [
    { date: "2023-10-01", plannedAmount: 100, actualAmount: 95 },
    { date: "2023-10-02", plannedAmount: 120, actualAmount: 115 },
    { date: "2023-10-03", plannedAmount: 110, actualAmount: 105 },
    { date: "2023-10-04", plannedAmount: 130, actualAmount: 125 },
    { date: "2023-10-05", plannedAmount: 90, actualAmount: 88 },
    { date: "2023-10-06", plannedAmount: 100, actualAmount: 102 },
    { date: "2023-10-07", plannedAmount: 110, actualAmount: 108 },
]

const elementCompletionData = [
    { name: "Completed", value: 65 },
    { name: "In Progress", value: 25 },
    { name: "Pending", value: 10 },
]

const monthlyProgressData = [
    { month: "Jan", planned: 100, actual: 95 },
    { month: "Feb", planned: 120, actual: 115 },
    { month: "Mar", planned: 140, actual: 130 },
    { month: "Apr", planned: 160, actual: 155 },
    { month: "May", planned: 180, actual: 175 },
    { month: "Jun", planned: 200, actual: 190 },
]



// Custom color palette
const colors = {
    primary: '#15803d', // Green-700
    secondary: '#22c55e', // Green-500
    tertiary: '#86efac', // Green-300
    background: '#f0fdf4', // Green-50
    border: '#BBF7D0', // Green-200
}
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function ManagerDashboard() {
    const { user, loading, error } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (user.role !== 'manager') {
                router.push('/dashboard')
            }
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-green-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
                    <p className="mt-2 text-black font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-green-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="text-red-600 text-xl mb-2">Error</div>
                    <p className="text-black">{error.message}</p>
                </div>
            </div>
        )
    }

    if (!user) {
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
                                    <CardTitle className="text-3xl font-bold text-black">Manager Dashboard</CardTitle>
                                    <CardDescription className="text-gray-600 text-lg mt-2">
                                        Welcome back, {user.username}!
                                    </CardDescription>
                                </div>
                                <div className="bg-green-100 rounded-full px-4 py-2 text-black font-medium">
                                    Manager View
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                    <h3 className="text-black font-semibold mb-2">Project Reports</h3>
                                    <p className="text-gray-600">View and analyze all project data</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                    <h3 className="text-black font-semibold mb-2">Employee Management</h3>
                                    <p className="text-gray-600">Manage team assignments and roles</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                                    <h3 className="text-black font-semibold mb-2">Analytics</h3>
                                    <p className="text-gray-600">Track performance metrics</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-green-200 shadow-lg">
                            <CardHeader className="border-b border-green-100">
                                <CardTitle className="text-black">Daily Casting Progress</CardTitle>
                                <CardDescription className="text-gray-600">Planned vs actual casting amounts</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ChartContainer
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyCastingData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" stroke="#000000" />
                                            <YAxis stroke="#000000" />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Bar dataKey="plannedAmount" fill={colors.primary} name="Planned Amount" />
                                            <Bar dataKey="actualAmount" fill={colors.secondary} name="Actual Amount" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 shadow-lg">
                            <CardHeader className="border-b border-green-100">
                                <CardTitle className="text-black">Element Completion</CardTitle>
                                <CardDescription className="text-gray-600">Overall casting progress</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ChartContainer
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={elementCompletionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {elementCompletionData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={index === 0 ? colors.primary : colors.tertiary}
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {/* Donut Chart for Element Completion Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Element Completion Status</CardTitle>
                                <CardDescription>Overview of element completion in the project</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={elementCompletionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {elementCompletionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Line Chart for Monthly Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Progress</CardTitle>
                                <CardDescription>Planned vs Actual progress over months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Line type="monotone" dataKey="planned" stroke="#8884d8" activeDot={{ r: 8 }} />
                                            <Line type="monotone" dataKey="actual" stroke="#82ca9d" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>


                        {/* Area Chart for Cumulative Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cumulative Progress</CardTitle>
                                <CardDescription>Cumulative planned vs actual progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" />
                                            <Area type="monotone" dataKey="actual" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    )
}