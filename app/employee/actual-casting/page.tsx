'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface DailyReport {
    id: string
    date: string
    job_number: string
    table_number: string
    element_id: string
    planned_volume: number
    planned_weight: number
}

const actualCastingSchema = z.object({
    daily_report_id: z.string().min(1, 'Please select a daily report'),
    casted_amount: z.number().min(0, 'Casted amount must be a positive number'),
    remarks: z.string().optional(),
})

type ActualCastingFormData = z.infer<typeof actualCastingSchema>

export default function ActualCastingInput() {
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
    const router = useRouter()
    const { user, loading } = useAuth()

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ActualCastingFormData>({
        resolver: zodResolver(actualCastingSchema),
        defaultValues: {
            daily_report_id: '',
            casted_amount: 0,
            remarks: '',
        },
    })

    const fetchDailyReports = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/daily-reports?date=${filterDate}`)
            if (!response.ok) throw new Error('Failed to fetch daily reports')
            const data = await response.json()
            setDailyReports(data.reports)
        } catch (error) {
            console.error('Error fetching daily reports:', error)
            toast({
                title: "Error",
                description: "Failed to fetch daily reports",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [filterDate])
    
    useEffect(() => {
        if (!loading && user?.role !== 'actual_employee') {
            router.push('/dashboard')
        } else if (!loading) {
            fetchDailyReports()
        }
    }, [user, loading, router, fetchDailyReports])

    

    useEffect(() => {
        fetchDailyReports()
    }, [fetchDailyReports, filterDate])

    const onSubmit = async (data: ActualCastingFormData) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/actual-castings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) throw new Error('Failed to submit actual casting')

            toast({
                title: "Success",
                description: "Actual casting submitted successfully!",
            })
            reset()
            setSelectedReport(null)
            fetchDailyReports()
        } catch (error) {
            console.error('Error submitting actual casting:', error)
            toast({
                title: "Error",
                description: "Failed to submit actual casting",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleReportSelect = (reportId: string) => {
        const report = dailyReports.find(r => r.id === reportId)
        setSelectedReport(report || null)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (user?.role !== 'actual_employee') {
        return null
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Actual Casting Input</CardTitle>
                        <CardDescription>Select a daily report and input the actual casting details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label htmlFor="filter-date">Filter by Date</Label>
                            <div className="flex items-center mt-1">
                                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="filter-date"
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="daily_report_id">Select Daily Report</Label>
                                <Controller
                                    name="daily_report_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                handleReportSelect(value)
                                            }}
                                            value={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a daily report" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dailyReports.map((report) => (
                                                    <SelectItem key={report.id} value={report.id}>
                                                        {report.date} - Job: {report.job_number}, Table: {report.table_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.daily_report_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.daily_report_id.message}</p>
                                )}
                            </div>

                            {selectedReport && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Selected Report Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Job No.</TableHead>
                                                    <TableHead>Table No.</TableHead>
                                                    <TableHead>Element ID</TableHead>
                                                    <TableHead>Planned Volume</TableHead>
                                                    <TableHead>Planned Weight</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>{selectedReport.date}</TableCell>
                                                    <TableCell>{selectedReport.job_number}</TableCell>
                                                    <TableCell>{selectedReport.table_number}</TableCell>
                                                    <TableCell>{selectedReport.element_id}</TableCell>
                                                    <TableCell>{selectedReport.planned_volume}</TableCell>
                                                    <TableCell>{selectedReport.planned_weight}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="casted_amount">Actual Casted Amount</Label>
                                <Controller
                                    name="casted_amount"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            id="casted_amount"
                                            placeholder="Enter actual casted amount"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                    )}
                                />
                                {errors.casted_amount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.casted_amount.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Controller
                                    name="remarks"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            id="remarks"
                                            placeholder="Enter any remarks"
                                            {...field}
                                        />
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Actual Casting'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}