'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Layout from '@/components/Layout'
import { CalendarIcon, Loader2, ClipboardList, AlertCircle, Building2, Table2, Package } from 'lucide-react'

interface PlannedCasting {
    id: number
    element_id: number
    planned_volume: number
    planned_weight: number
    planned_date: string
}

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
}

const dailyReportSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    user_id: z.number().min(1, 'User ID is required'),
    job_id: z.union([
        z.number(),
        z.string().transform((val) => parseInt(val, 10))
    ]).refine((val) => !isNaN(val) && val > 0, 'Job is required'),
    table_id: z.union([
        z.number(),
        z.string().transform((val) => parseInt(val, 10))
    ]).refine((val) => !isNaN(val) && val > 0, 'Table is required'),
    element_id: z.union([
        z.number(),
        z.string().transform((val) => parseInt(val, 10))
    ]).refine((val) => !isNaN(val) && val > 0, 'Element is required'),
    planned_casting_id: z.number().min(1, 'Planned casting is required'),
    mep: z.string().optional(),
    remarks: z.string().optional(),
})

type DailyReportFormData = z.infer<typeof dailyReportSchema>

export default function DailyReportInput(): JSX.Element {
    const [jobs, setJobs] = useState<readonly Job[]>([])
    const [tables, setTables] = useState<readonly Table[]>([])
    const [elements, setElements] = useState<readonly Element[]>([])
    const [plannedCastings, setPlannedCastings] = useState<PlannedCasting[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get('userId')

    const today = new Date().toISOString().split('T')[0]

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<DailyReportFormData>({
        resolver: zodResolver(dailyReportSchema),
        defaultValues: {
            date: today,
            user_id: userId ? parseInt(userId, 10) : 0,
        }
    })

    const selectedDate = watch('date')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, tablesRes, elementsRes] = await Promise.all([
                    fetch('/api/jobs'),
                    fetch('/api/tables'),
                    fetch('/api/elements')
                ]);

                if (!jobsRes.ok || !tablesRes.ok || !elementsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [jobsData, tablesData, elementsData] = await Promise.all([
                    jobsRes.json(),
                    tablesRes.json(),
                    elementsRes.json()
                ]);

                setJobs(jobsData);
                setTables(tablesData);
                setElements(elementsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch required data",
                    variant: "destructive",
                });
            }
        };

        void fetchData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchPlannedCastings(selectedDate);
        }
    }, [selectedDate]);

    const fetchPlannedCastings = async (date: string) => {
        try {
            const response = await fetch(`/api/planned-castings?date=${date}`);
            if (!response.ok) {
                throw new Error('Failed to fetch planned castings');
            }
            const data = await response.json();
            setPlannedCastings(data);
        } catch (error) {
            console.error('Error fetching planned castings:', error);
            toast({
                title: "Error",
                description: "Failed to fetch planned castings",
                variant: "destructive",
            });
        }
    };

    const onSubmit = async (data: DailyReportFormData) => {
        if (!userId) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/daily-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    user_id: parseInt(userId, 10),
                })
            });

            if (!response.ok) throw new Error('Failed to submit daily report');

            toast({
                title: "Success",
                description: "Daily report submitted successfully!",
            });
            router.push('/daily-reports');
        } catch (error) {
            console.error('Error submitting daily report:', error);
            toast({
                title: "Error",
                description: "An error occurred while submitting the daily report",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const FieldError = ({ error }: { error?: { message?: string } }) => {
        if (!error?.message) return null;
        return (
            <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error.message}</span>
            </div>
        );
    };

    const noPlannedCastingsWarning = selectedDate && plannedCastings.length === 0 && (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                No planned castings for {selectedDate}. Please contact your manager.
            </AlertDescription>
        </Alert>
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Card className="w-full max-w-4xl mx-auto border-emerald-100">
                    <CardHeader className="space-y-4 bg-emerald-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <ClipboardList className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-black">Daily Report Input</CardTitle>
                                    <CardDescription className="text-emerald-700">Enter the details for today&apos;s production report</CardDescription>
                                </div>
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive" className="bg-red-50 border-red-200">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-600">
                                    Please correct the following errors:
                                    <ul className="list-disc list-inside mt-2">
                                        {Object.entries(errors).map(([field, error]) => (
                                            <li key={field}>
                                                {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}: {error?.message}
                                            </li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {noPlannedCastingsWarning}
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2 bg-emerald-50">
                                    <TabsTrigger
                                        value="basic"
                                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                                    >
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Basic Information
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="details"
                                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Details & Notes
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-6 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Date Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="flex items-center gap-2 text-black">
                                                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                                                Date
                                            </Label>
                                            <Controller
                                                name="date"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="space-y-1">
                                                        <Input
                                                            type="date"
                                                            id="date"
                                                            {...field}
                                                            className={`border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 ${errors.date ? 'border-red-500' : ''
                                                                }`}
                                                        />
                                                        <FieldError error={errors.date} />
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Job Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="job_id" className="flex items-center gap-2 text-black">
                                                <Building2 className="h-4 w-4 text-emerald-600" />
                                                Job Number
                                            </Label>
                                            <Controller
                                                name="job_id"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="space-y-1">
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString()}
                                                        >
                                                            <SelectTrigger
                                                                id="job_id"
                                                                className={`border-emerald-200 focus:ring-emerald-400 ${errors.job_id ? 'border-red-500' : ''
                                                                    }`}
                                                            >
                                                                <SelectValue placeholder="Select Job No." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {jobs.map((job) => (
                                                                    <SelectItem
                                                                        key={job.id}
                                                                        value={job.id.toString()}
                                                                        className="focus:bg-emerald-50"
                                                                    >
                                                                        {job.job_number} - {job.description}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FieldError error={errors.job_id} />
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Table Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="table_id" className="flex items-center gap-2 text-black">
                                                <Table2 className="h-4 w-4 text-emerald-600" />
                                                Table Number
                                            </Label>
                                            <Controller
                                                name="table_id"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="space-y-1">
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString()}
                                                        >
                                                            <SelectTrigger
                                                                id="table_id"
                                                                className={`border-emerald-200 focus:ring-emerald-400 ${errors.table_id ? 'border-red-500' : ''
                                                                    }`}
                                                            >
                                                                <SelectValue placeholder="Select Table No." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {tables.map((table) => (
                                                                    <SelectItem
                                                                        key={table.id}
                                                
                                                                        value={table.id.toString()}
                                                                        className="focus:bg-emerald-50"
                                                                    >
                                                                        {table.table_number} - {table.description}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FieldError error={errors.table_id} />
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Planned Casting Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="planned_casting_id" className="flex items-center gap-2 text-black">
                                                <Package className="h-4 w-4 text-emerald-600" />
                                                Planned Casting
                                            </Label>
                                            <Controller
                                                name="planned_casting_id"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="space-y-1">
                                                        <Select
                                                            onValueChange={(value) => {
                                                                const plannedCasting = plannedCastings.find(pc => pc.id === Number(value));
                                                                if (plannedCasting) {
                                                                    field.onChange(Number(value));
                                                                    setValue('element_id', plannedCasting.element_id);
                                                                }
                                                            }}
                                                            value={field.value?.toString()}
                                                            disabled={plannedCastings.length === 0}
                                                        >
                                                            <SelectTrigger
                                                                id="planned_casting_id"
                                                                className={`border-emerald-200 focus:ring-emerald-400 ${errors.planned_casting_id ? 'border-red-500' : ''
                                                                    }`}
                                                            >
                                                                <SelectValue placeholder="Select Planned Casting" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {plannedCastings.map((casting) => {
                                                                    const element = elements.find(e => e.id === casting.element_id);
                                                                    return (
                                                                        <SelectItem
                                                                            key={casting.id}
                                                                            value={casting.id.toString()}
                                                                            className="focus:bg-emerald-50"
                                                                        >
                                                                            {element?.element_id} (Volume: {casting.planned_volume}, Weight: {casting.planned_weight})
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                        <FieldError error={errors.planned_casting_id} />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details" className="space-y-6 pt-4">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="mep" className="text-black">MEP Details</Label>
                                            <Controller
                                                name="mep"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        id="mep"
                                                        {...field}
                                                        placeholder="Enter MEP details..."
                                                        className="min-h-[100px] border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="remarks" className="text-black">Additional Remarks</Label>
                                            <Controller
                                                name="remarks"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        id="remarks"
                                                        {...field}
                                                        placeholder="Enter any additional remarks..."
                                                        className="min-h-[100px] border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-between items-center pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const newTab = activeTab === 'basic' ? 'details' : 'basic'
                                        setActiveTab(newTab)
                                    }}
                                    className="border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                                >
                                    {activeTab === 'basic' ? 'Next: Details' : 'Back to Basic Info'}
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Submitting...
                                        </>
                                    ) : 'Submit Report'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}