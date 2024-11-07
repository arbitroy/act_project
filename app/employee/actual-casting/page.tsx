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
import { toast } from "@/components/ui/use-toast"
import { Loader2, Calendar, ClipboardList, Box, Activity, Calculator } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface DailyReport {
    id: number
    date: string
    job_number: string
    table_number: string
    element_code: string
    planned_amount: number
    planned_volume: number
}

const actualCastingSchema = z.object({
    daily_report_id: z.string().min(1, 'Please select an element'),
    casted_amount: z.number().min(0, 'Casted amount must be a positive number'),
    casted_volume: z.number().min(0, 'Casted volume must be a positive number'),
    remarks: z.string().optional(),
})

type ActualCastingFormData = z.infer<typeof actualCastingSchema>

export default function ActualCastingInput() {
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null)
    const [volumePerUnit, setVolumePerUnit] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
    const router = useRouter()
    const { user, loading } = useAuth()

    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ActualCastingFormData>({
        resolver: zodResolver(actualCastingSchema),
        defaultValues: {
            daily_report_id: '',
            casted_amount: 0,
            casted_volume: 0,
            remarks: '',
        },
    })

    // Watch the casted_amount to update volume automatically
    const castedAmount = watch('casted_amount')

    // Update casted volume whenever casted amount changes
    useEffect(() => {
        if (volumePerUnit && castedAmount) {
            const calculatedVolume = Number((volumePerUnit * castedAmount).toFixed(2))
            setValue('casted_volume', calculatedVolume)
        }
    }, [castedAmount, volumePerUnit, setValue])

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
    }, [fetchDailyReports])

    const handleReportSelect = (reportId: string) => {
        const report = dailyReports.find(r => r.id.toString() === reportId)
        if (report) {
            setSelectedReport(report)
            // Calculate volume per unit from planned values
            const volumePerUnit = Number((report.planned_volume / report.planned_amount).toFixed(4))
            setVolumePerUnit(volumePerUnit)
            // Reset casted amount when selecting new element
            setValue('casted_amount', 0)
            setValue('casted_volume', 0)
        } else {
            setSelectedReport(null)
            setVolumePerUnit(0)
        }
    }

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
            setVolumePerUnit(0)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (user?.role !== 'actual_employee') {
        return null
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
                <div className="container mx-auto px-4 py-8">
                    <Card className="w-full max-w-4xl mx-auto shadow-lg border-green-100">
                        <CardHeader className="border-b border-green-100 bg-green-50">
                            <div className="flex items-center space-x-2">
                                <ClipboardList className="h-6 w-6 text-green-600" />
                                <CardTitle className="text-2xl font-bold text-black">Actual Casting Input</CardTitle>
                            </div>
                            <CardDescription className="text-gray-600">Record your daily casting details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6 bg-white p-4 rounded-lg border border-green-100">
                                <Label htmlFor="filter-date" className="text-black font-medium">Select Date</Label>
                                <div className="flex items-center mt-1">
                                    <Calendar className="mr-2 h-4 w-4 text-green-500" />
                                    <Input
                                        id="filter-date"
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="w-full border-green-200 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="daily_report_id" className="text-black font-medium">Select Element</Label>
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
                                                <SelectTrigger className="border-green-200 focus:ring-green-500 focus:border-green-500">
                                                    <SelectValue placeholder="Select an element" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dailyReports.map((report) => (
                                                        <SelectItem 
                                                            key={report.id} 
                                                            value={report.id.toString()}
                                                            className="hover:bg-green-50 text-black"
                                                        >
                                                            Element: {report.element_code} ({report.planned_amount} units, {report.planned_volume} m³)
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
                                    <Card className="border-green-100 shadow-md">
                                        <CardHeader className="bg-green-50 border-b border-green-100">
                                            <div className="flex items-center space-x-2">
                                                <Box className="h-5 w-5 text-green-600" />
                                                <CardTitle className="text-lg text-black">Element Details</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm text-gray-600">Element ID</Label>
                                                    <p className="font-medium text-black">{selectedReport.element_code}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600">Date</Label>
                                                    <p className="font-medium text-black">{selectedReport.date}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600">Job Number</Label>
                                                    <p className="font-medium text-black">{selectedReport.job_number}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600">Table Number</Label>
                                                    <p className="font-medium text-black">{selectedReport.table_number}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600">Planned Amount</Label>
                                                    <p className="font-medium text-black">{selectedReport.planned_amount} units</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600">Planned Volume</Label>
                                                    <p className="font-medium text-black">{selectedReport.planned_volume} m³</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600">Volume per Unit</Label>
                                                    <p className="font-medium text-black">{volumePerUnit} m³</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="casted_amount" className="text-black font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Activity className="h-4 w-4 text-green-500" />
                                                <span>Actual Casted Amount</span>
                                            </div>
                                        </Label>
                                        <Controller
                                            name="casted_amount"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    id="casted_amount"
                                                    placeholder="Enter actual amount"
                                                    className="border-green-200 focus:ring-green-500 focus:border-green-500 text-black"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                        {errors.casted_amount && (
                                            <p className="text-red-500 text-sm mt-1">{errors.casted_amount.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="casted_volume" className="text-black font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Calculator className="h-4 w-4 text-green-500" />
                                                <span>Calculated Volume (Automatic)</span>
                                            </div>
                                        </Label>
                                        <Controller
                                            name="casted_volume"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    id="casted_volume"
                                                    className="border-green-200 focus:ring-green-500 focus:border-green-500 text-black bg-gray-50"
                                                    {...field}
                                                    disabled
                                                    value={field.value || 0}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="text-black font-medium">Remarks</Label>
                                    <Controller
                                        name="remarks"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                id="remarks"
                                                placeholder="Add any additional notes here"
                                                className="border-green-200 focus:ring-green-500 focus:border-green-500 text-black"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Submit Actual Casting'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}