'use client'

import React, { useState, useEffect, Suspense } from 'react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Interfaces
interface PlannedCasting {
    id: number;
    element_id: number;
    planned_volume: number;
    planned_amount: number;
    planned_date: string;
}

interface Job {
    readonly id: number;
    readonly job_number: string;
    readonly description: string;
}

interface Table {
    readonly id: number;
    readonly table_number: string;
    readonly description: string;
}

interface Element {
    readonly id: number;
    readonly element_id: string;
    readonly volume: string;
}

interface RemainingQuantity {
    elementId: number;
    totalVolume: number;
    totalCasted: number;
    remainingVolume: number;
    completionPercentageVolume: number;
    totalPlannedAmount: number;
    totalCastedAmount: number;
    remainingAmount: number;
    completionPercentageAmount: number;
}

// Zod Schema
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
    planned_volume: z.number().min(0, 'Volume must be positive').optional(),
    planned_amount: z.number().min(0, 'Amount must be positive').optional(),
    mep: z.string().optional(),
    remarks: z.string().optional(),
});

type DailyReportFormData = z.infer<typeof dailyReportSchema>;

const DailyReportForm = ({ userId }: { userId: string | null }) => {
    // State management
    const [jobs, setJobs] = useState<Job[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [elements, setElements] = useState<Element[]>([]);
    const [plannedCastings, setPlannedCastings] = useState<PlannedCasting[]>([]);
    const [selectedElement, setSelectedElement] = useState<Element | null>(null);
    const [remainingQuantity, setRemainingQuantity] = useState<RemainingQuantity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const router = useRouter();

    const today = new Date().toISOString().split('T')[0];

    // Form setup
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DailyReportFormData>({
        resolver: zodResolver(dailyReportSchema),
        defaultValues: {
            date: today,
            user_id: userId ? parseInt(userId, 10) : 0,
        }
    });

    const selectedDate = watch('date');
    const selectedElementId = watch('element_id');
    const selectedJobId = watch('job_id');

    // Data fetching effects
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        void fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            void fetchPlannedCastings(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (selectedElementId) {
            void fetchRemainingQuantity(selectedElementId);
            const element = elements.find(e => e.id === selectedElementId);
            setSelectedElement(element || null);
        }
    }, [selectedElementId, elements]);

    // Data fetching functions
    const fetchPlannedCastings = async (date: string) => {
        try {
            const response = await fetch(`/api/planned-castings?date=${date}`);
            if (!response.ok) throw new Error('Failed to fetch planned castings');
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

    const fetchRemainingQuantity = async (elementId: number) => {
        try {
            const response = await fetch(`/api/elements/${elementId}/remaining`);
            if (!response.ok) throw new Error('Failed to fetch remaining quantity');
            const data = await response.json();
            setRemainingQuantity(data);
        } catch (error) {
            console.error('Error fetching remaining quantity:', error);
            toast({
                title: "Error",
                description: "Failed to fetch remaining quantity",
                variant: "destructive",
            });
        }
    };

    // Form submission
    const onSubmit = async (data: DailyReportFormData) => {
        if (!userId) {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/daily-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    user_id: parseInt(userId, 10),
                }),
            });

            if (!response.ok) throw new Error('Failed to submit daily report');

            toast({
                title: "Success",
                description: "Daily report submitted successfully!",
            });

            // Create planned casting if volume and amount are provided
            if (data.planned_volume && data.planned_amount) {
                const planningResponse = await fetch('/api/planned-castings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        element_id: data.element_id,
                        planned_volume: data.planned_volume,
                        planned_amount: data.planned_amount,
                        planned_date: data.date,
                    }),
                });

                if (!planningResponse.ok) {
                    throw new Error('Failed to create planned casting');
                }

                toast({
                    title: "Success",
                    description: "Planned casting created successfully!",
                });
            }

            reset();
            router.push('/daily-reports');
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "An error occurred while submitting the form",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper components
    const FieldError = ({ error }: { error?: { message?: string } }) => {
        if (!error?.message) return null;
        return (
            <div className="flex items-center mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{error.message}</span>
            </div>
        );
    };

    // Warning display
    const noPlannedCastingsWarning = selectedDate && plannedCastings.length === 0 && (
        <Alert variant="warning" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                No planned castings for {selectedDate}. Please create a new planned casting.
            </AlertDescription>
        </Alert>
    );

    return (
        <Card className="w-full max-w-4xl mx-auto border-emerald-100">
            <CardHeader className="space-y-4 bg-emerald-50/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <CardTitle className="text-black">Daily Report & Planning</CardTitle>
                            <CardDescription className="text-emerald-700">
                                Enter production details and plan future castings
                            </CardDescription>
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
                        <TabsList className="grid w-full grid-cols-3 bg-emerald-50">
                            <TabsTrigger
                                value="basic"
                                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                            >
                                <Building2 className="h-4 w-4 mr-2" />
                                Basic Information
                            </TabsTrigger>
                            <TabsTrigger
                                value="planning"
                                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                            >
                                <Package className="h-4 w-4 mr-2" />
                                Planning
                            </TabsTrigger>
                            <TabsTrigger
                                value="notes"
                                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Notes
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
                                            <Input
                                                type="date"
                                                {...field}
                                                className={`border-emerald-200 focus:ring-emerald-400 ${
                                                    errors.date ? 'border-red-500' : ''
                                                }`}
                                            />
                                        )}
                                    />
                                    <FieldError error={errors.date} />
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
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                            >
                                                <SelectTrigger className="border-emerald-200">
                                                    <SelectValue placeholder="Select Job" />
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
                                        )}
                                    />
                                    <FieldError error={errors.job_id} />
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
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                            >
                                                <SelectTrigger className="border-emerald-200">
                                                    <SelectValue placeholder="Select Table" />
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
                                        )}
                                    />
                                    <FieldError error={errors.table_id} />
                                </div>

                                {/* Element Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="element_id" className="flex items-center gap-2 text-black">
                                        <Package className="h-4 w-4 text-emerald-600" />
                                        Element
                                    </Label>
                                    <Controller
                                        name="element_id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                            >
                                                <SelectTrigger className="border-emerald-200">
                                                    <SelectValue placeholder="Select Element" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {elements.map((element) => (
                                                        <SelectItem
                                                            key={element.id}
                                                            value={element.id.toString()}
                                                            className="focus:bg-emerald-50"
                                                        >
                                                            {element.element_id} ({element.volume} m³)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FieldError error={errors.element_id} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="planning" className="space-y-6 pt-4">
                            {/* Planning Section */}
                            {selectedElement && remainingQuantity && (
                                <div className="space-y-6">
                                    {/* Element Status */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-emerald-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-emerald-700">Total Volume</Label>
                                            <p className="font-medium">{remainingQuantity.totalVolume} m³</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-emerald-700">Remaining Volume</Label>
                                            <p className="font-medium">{remainingQuantity.remainingVolume} m³</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-emerald-700">Completion</Label>
                                            <p className="font-medium">{remainingQuantity.completionPercentageVolume}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-emerald-700">Total Amount</Label>
                                            <p className="font-medium">{remainingQuantity.totalPlannedAmount}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-emerald-700">Remaining Amount</Label>
                                            <p className="font-medium">{remainingQuantity.remainingAmount}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-emerald-700">Amount Completion</Label>
                                            <p className="font-medium">{remainingQuantity.completionPercentageAmount}%</p>
                                        </div>
                                    </div>

                                    {/* New Planning Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="planned_volume" className="text-black">
                                                Planned Volume (m³)
                                            </Label>
                                            <Controller
                                                name="planned_volume"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                        className="border-emerald-200"
                                                    />
                                                )}
                                            />
                                            <FieldError error={errors.planned_volume} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="planned_amount" className="text-black">
                                                Planned Amount
                                            </Label>
                                            <Controller
                                                name="planned_amount"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        className="border-emerald-200"
                                                    />
                                                )}
                                            />
                                            <FieldError error={errors.planned_amount} />
                                        </div>
                                    </div>

                                    {/* Planned Castings Table */}
                                    {plannedCastings.length > 0 && (
                                        <div className="mt-6">
                                            <Label className="text-black mb-2 block">Planned Castings</Label>
                                            <div className="border rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Element</TableHead>
                                                            <TableHead>Volume (m³)</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Date</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {plannedCastings.map((casting) => {
                                                            const element = elements.find(e => e.id === casting.element_id);
                                                            return (
                                                                <TableRow key={casting.id}>
                                                                    <TableCell>{element?.element_id}</TableCell>
                                                                    <TableCell>{casting.planned_volume}</TableCell>
                                                                    <TableCell>{casting.planned_amount}</TableCell>
                                                                    <TableCell>
                                                                        {new Date(casting.planned_date).toLocaleDateString()}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-6 pt-4">
                            <div className="space-y-6">
                                {/* MEP Details */}
                                <div className="space-y-2">
                                    <Label htmlFor="mep" className="text-black">MEP Details</Label>
                                    <Controller
                                        name="mep"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="Enter MEP details..."
                                                className="min-h-[100px] border-emerald-200"
                                            />
                                        )}
                                    />
                                </div>

                                {/* Additional Remarks */}
                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="text-black">Additional Remarks</Label>
                                    <Controller
                                        name="remarks"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="Enter any additional remarks..."
                                                className="min-h-[100px] border-emerald-200"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Form Actions */}
                    <div className="flex justify-between items-center pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const tabs = ['basic', 'planning', 'notes'];
                                const currentIndex = tabs.indexOf(activeTab);
                                const newTab = tabs[(currentIndex + 1) % tabs.length];
                                setActiveTab(newTab);
                            }}
                            className="border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                        >
                            {activeTab === 'notes' ? 'Back to Basic Info' : `Next: ${
                                activeTab === 'basic' ? 'Planning' : 'Notes'
                            }`}
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[200px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSubmitting ? (
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
    );
};

export default function DailyReportInput(): JSX.Element {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <DailyReportFormWrapper />
                </Suspense>
            </div>
        </Layout>
    )
}

function DailyReportFormWrapper() {
    const searchParams = useSearchParams()
    const userId = searchParams.get('userId')

    return <DailyReportForm userId={userId} />
}