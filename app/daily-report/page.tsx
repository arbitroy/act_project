'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import Layout from '@/components/Layout'
import { CalendarIcon, Loader2, ClipboardList } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// Define strict interfaces with readonly properties
interface Job {
    readonly id: number
    readonly job_number: string
    readonly description: string
}

interface Table {
    readonly id: number
    readonly table_number: string
    readonly description: string
}

interface Element {
    readonly id: number
    readonly element_id: string
    readonly volume: number
    readonly weight: number
    readonly planned_volume: number
    readonly planned_weight: number
}


// Define a schema for form validation
const dailyReportSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    job_id: z.number().int().positive('Job is required'),
    table_id: z.number().int().positive('Table is required'),
    element_id: z.number().int().positive('Element is required'),
    planned_volume: z.number().nonnegative(),
    planned_weight: z.number().nonnegative(),
    mep: z.string().optional(),
    remarks: z.string().optional()
})

// Define type for form data based on the schema
type DailyReportFormData = z.infer<typeof dailyReportSchema>

// Type for API response
interface ApiResponse<T> {
    data?: T
    error?: string
}

export default function DailyReportInput(): JSX.Element {
    const [jobs, setJobs] = useState<readonly Job[]>([])
    const [tables, setTables] = useState<readonly Table[]>([])
    const [elements, setElements] = useState<readonly Element[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useAuth()
    const router = useRouter()

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<DailyReportFormData>({
        resolver: zodResolver(dailyReportSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            planned_volume: 0,
            planned_weight: 0
        }
    })

    const selectedElementId = watch('element_id')

    useEffect(() => {
        const fetchTables = async (): Promise<void> => {
            try {
                const response = await fetch('/api/tables')
                if (!response.ok) throw new Error('Failed to fetch tables')
                const data: ApiResponse<Table[]> = await response.json()
                if (data.data) setTables(data.data)
            } catch (error) {
                console.error('Error fetching tables:', error)
                toast({
                    title: "Error",
                    description: "Failed to fetch tables data",
                    variant: "destructive",
                })
            }
        }
        
        void fetchJobs()
        void fetchTables()
        void fetchElements()
    }, [setTables])

    useEffect(() => {
        if (selectedElementId) {
            const selectedElement = elements.find(e => e.id === selectedElementId)
            if (selectedElement) {
                setValue('planned_volume', selectedElement.planned_volume)
                setValue('planned_weight', selectedElement.planned_weight)
            }
        }
    }, [selectedElementId, elements, setValue])

    const fetchJobs = async (): Promise<void> => {
        try {
            const response = await fetch('/api/jobs')
            if (!response.ok) throw new Error('Failed to fetch jobs')
            const data: ApiResponse<Job[]> = await response.json()
            if (data.data) setJobs(data.data)
        } catch (error) {
            console.error('Error fetching jobs:', error)
            toast({
                title: "Error",
                description: "Failed to fetch jobs data",
                variant: "destructive",
            })
        }
    }

    

    const fetchElements = async (): Promise<void> => {
        try {
            const response = await fetch('/api/elements')
            if (!response.ok) throw new Error('Failed to fetch elements')
            const data: ApiResponse<Element[]> = await response.json()
            if (data.data) setElements(data.data)
        } catch (error) {
            console.error('Error fetching elements:', error)
            toast({
                title: "Error",
                description: "Failed to fetch elements data",
                variant: "destructive",
            })
        }
    }

    const onSubmit = async (data: DailyReportFormData): Promise<void> => {
        if (!user?.id) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/daily-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    user_id: user.id,
                })
            })

            if (!response.ok) throw new Error('Failed to submit daily report')

            toast({
                title: "Success",
                description: "Daily report submitted successfully!",
            })
            router.push('/daily-reports')
        } catch (error) {
            console.error('Error submitting daily report:', error)
            toast({
                title: "Error",
                description: "An error occurred while submitting the daily report",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <div className="container mx-auto p-4 bg-background min-h-screen">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <ClipboardList className="h-6 w-6" />
                            <CardTitle>Daily Report Input</CardTitle>
                        </div>
                        <CardDescription>Enter the details for today&apos;s production report</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <div className="relative">
                                        <Controller
                                            name="date"
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    <Input
                                                        type="date"
                                                        id="date"
                                                        {...field}
                                                        className="pl-10"
                                                        aria-describedby="date-error"
                                                    />
                                                    {errors.date && (
                                                        <p id="date-error" className="text-sm text-red-500 mt-1">
                                                            {errors.date.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />
                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="job_id">Job No.</Label>
                                    <Controller
                                        name="job_id"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <Select
                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                    defaultValue={field.value?.toString()}
                                                >
                                                    <SelectTrigger id="job_id" aria-describedby="job-error">
                                                        <SelectValue placeholder="Select Job No." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {jobs.map((job) => (
                                                            <SelectItem key={job.id} value={job.id.toString()}>
                                                                {job.job_number} - {job.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.job_id && (
                                                    <p id="job-error" className="text-sm text-red-500 mt-1">
                                                        {errors.job_id.message}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="table_id">Table No.</Label>
                                    <Controller
                                        name="table_id"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <Select
                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                    defaultValue={field.value?.toString()}
                                                >
                                                    <SelectTrigger id="table_id" aria-describedby="table-error">
                                                        <SelectValue placeholder="Select Table No." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tables.map((table) => (
                                                            <SelectItem key={table.id} value={table.id.toString()}>
                                                                {table.table_number} - {table.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.table_id && (
                                                    <p id="table-error" className="text-sm text-red-500 mt-1">
                                                        {errors.table_id.message}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                {/* Similar error handling for other fields... */}
                                
                                <div className="space-y-2">
                                    <Label htmlFor="mep">MEP</Label>
                                    <Controller
                                        name="mep"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                id="mep"
                                                {...field}
                                                aria-describedby="mep-error"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Controller
                                        name="remarks"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                id="remarks"
                                                {...field}
                                                aria-describedby="remarks-error"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <CardFooter className="pt-6">
                                <Button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full"
                                    aria-label={isLoading ? "Submitting daily report..." : "Submit daily report"}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Submitting...
                                        </>
                                    ) : 'Submit Daily Report'}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}