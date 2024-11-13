'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { DailyReportTable } from './DailyReportTable';
import {
    DailyReportFormData,
    DailyReportRecord,
    dailyReportSchema,
    PREDEFINED_REMARKS,
    Job,
    TableDB,
    Element,
    PlannedCasting,
    RemainingQuantity,
    PlannedCastingsTableProps,
    StatusItemProps,
    FieldErrorProps
} from './types';



const DailyReportForm = ({ userId }: { userId: string | null }) => {
    // State management
    const [jobs, setJobs] = useState<Job[]>([]);
    const [tables, setTables] = useState<TableDB[]>([]);
    const [elements, setElements] = useState<Element[]>([]);
    const [plannedCastings, setPlannedCastings] = useState<PlannedCasting[]>([]);
    const [selectedElement, setSelectedElement] = useState<Element | null>(null);
    const [remainingQuantity, setRemainingQuantity] = useState<RemainingQuantity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [savedRecords, setSavedRecords] = useState<DailyReportRecord[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const router = useRouter();


    const today = new Date().toISOString().split('T')[0];

    // Form setup
    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DailyReportFormData>({
        resolver: zodResolver(dailyReportSchema),
        defaultValues: {
            date: today,
            user_id: userId ? parseInt(userId, 10) : 0,
            mep: 'NO',
            rft: 'ACT',
            remarkType: 'PLANNED',
        }
    });

    const remarkType = watch('remarkType');
    const selectedDate = watch('date');
    const selectedElementId = watch('element_id');

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
            const element = elements.find(e => e.id === selectedElementId);
            setSelectedElement(element || null);

            // Add this validation
            const plannedAmount = watch('planned_amount') || 0;
            if (element && plannedAmount > element.required_amount) {
                toast({
                    title: "Warning",
                    description: `Planned amount (${plannedAmount}) exceeds required amount (${element.required_amount})`,
                    variant: "default",
                });
            }

            void fetchRemainingQuantity(selectedElementId);
            void fetchPlannedCastings(selectedDate);
        }
    }, [selectedElementId, selectedDate, elements, watch]);

    useEffect(() => {
        if (selectedElement) {
            const amount = watch('planned_amount') || 0;
            const elementVolume = parseFloat(selectedElement.volume);
            const calculatedVolume = amount * elementVolume;
            setValue('planned_volume', calculatedVolume);

            // Add this validation
            if (amount > selectedElement.required_amount) {
                toast({
                    title: "Warning",
                    description: `Planned amount (${amount}) exceeds required amount (${selectedElement.required_amount})`,
                    variant: "warning",
                });
            }
        }
    }, [selectedElement, setValue, watch]);

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

    // Reset form and prepare for new record
    const prepareNewRecord = () => {
        reset({
            date: watch('date'),
            user_id: userId ? parseInt(userId, 10) : 0,
            mep: 'NO',
            remarkType: 'PLANNED'
        });
        setIsEditing(false);
        setEditingId(null);
        setActiveTab('basic');
    };

    // Handle saving a record (both new and edit)
    const onSaveRecord = async (data: DailyReportFormData) => {
        const selectedJob = jobs.find(j => j.id === data.job_id);
        const selectedTable = tables.find(t => t.id === data.table_id);
        const selectedElement = elements.find(e => e.id === data.element_id);

        const newRecord: DailyReportRecord = {
            id: editingId || Date.now(),
            job_number: selectedJob?.job_number || '',
            table_number: selectedTable?.table_number || '',
            element_id: selectedElement?.element_id || '',
            required_amount: selectedElement?.required_amount || 0,
            planned_amount: data.planned_amount,
            planned_volume: data.planned_volume,
            mep: data.mep,
            rft: data.rft,
            customRftSource: data.rft === 'OTHER' ? data.customRftSource : undefined,
            remarks: data.remarkType === 'CUSTOM'
                ? data.customRemark || ''
                : PREDEFINED_REMARKS[data.remarkType],
            original_data: data
        };


        if (isEditing) {
            setSavedRecords(records =>
                records.map(r => r.id === editingId ? newRecord : r)
            );
        } else {
            setSavedRecords(records => [...records, newRecord]);
        }

        prepareNewRecord();
        toast({
            title: "Success",
            description: `Record ${isEditing ? 'updated' : 'added'} successfully!`,
        });
    };

    // Handle editing a record
    const handleEdit = (record: DailyReportRecord) => {
        setIsEditing(true);
        setEditingId(record.id);

        // Set all form values from the original data
        Object.entries(record.original_data).forEach(([key, value]) => {
            setValue(key as keyof DailyReportFormData, value);
        });
        setActiveTab('basic');
    };

    // Handle deleting a record
    const handleDelete = (id: number) => {
        setSavedRecords(records => records.filter(r => r.id !== id));
        toast({
            title: "Success",
            description: "Record deleted successfully!",
        });
    };

    // Final submission of all records
    const handleFinalSubmit = async () => {
        if (savedRecords.length === 0) {
            toast({
                title: "Error",
                description: "Please add at least one record before submitting.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Process each record
            await Promise.all(savedRecords.map(async (record) => {
                const data = record.original_data;

                // Create planned casting
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

                const plannedCastingData = await planningResponse.json();

                // Create daily report
                const finalRemark = data.remarkType === 'CUSTOM'
                    ? data.customRemark
                    : PREDEFINED_REMARKS[data.remarkType];

                const reportResponse = await fetch('/api/daily-reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        planned_casting_id: plannedCastingData.id,
                        remarks: finalRemark,
                    }),
                });

                if (!reportResponse.ok) {
                    throw new Error('Failed to submit daily report');
                }

                return reportResponse.json();
            }));

            toast({
                title: "Success",
                description: `Successfully submitted ${savedRecords.length} records!`,
            });

            router.push('/daily-reports');
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "An error occurred while submitting the records",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };




    return (
        <div className="space-y-6">
            <Card className="w-full max-w-4xl mx-auto border-emerald-100">
                {isLoading ? (
                    <CardContent className="flex items-center justify-center p-8">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            <p className="text-sm text-emerald-600">Loading form data...</p>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="space-y-4 bg-emerald-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <ClipboardList className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-black">Daily Report & Planning</CardTitle>
                                        <CardDescription className="text-emerald-700">
                                            Enter production details and manage your planned castings
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
                        </CardHeader>

                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit(onSaveRecord)} className="space-y-6">
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
                                                            className={`border-emerald-200 focus:ring-emerald-400 ${errors.date ? 'border-red-500' : ''
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

                                        </div>
                                    </TabsContent>

                                    {/* Planning Tab */}
                                    <TabsContent value="planning" className="space-y-6 pt-4">
                                        {/* Element Selection */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="element_id">Element</Label>
                                                <Controller
                                                    name="element_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value?.toString()}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Element" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {elements.map((element) => (
                                                                    <SelectItem key={element.id} value={element.id.toString()}>
                                                                        {element.element_id} ({element.volume} m³)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            {/* Element Status */}
                                            {selectedElement && remainingQuantity && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-emerald-50 rounded-lg">
                                                    <StatusItem
                                                        label="Required Amount"
                                                        value={remainingQuantity.totalRequiredAmount}
                                                    />
                                                    <StatusItem
                                                        label="Planned Amount"
                                                        value={remainingQuantity.totalPlannedAmount}
                                                        className={remainingQuantity.totalPlannedAmount > remainingQuantity.totalRequiredAmount ? "text-amber-600" : ""}
                                                    />
                                                    <StatusItem
                                                        label="Remaining Amount"
                                                        value={Math.max(0, remainingQuantity.totalRequiredAmount - remainingQuantity.totalPlannedAmount)}
                                                    />
                                                    <StatusItem
                                                        label="Amount Progress"
                                                        value={`${Math.min(100, (remainingQuantity.totalPlannedAmount / remainingQuantity.totalRequiredAmount * 100)).toFixed(1)}%`}
                                                    />
                                                    <StatusItem
                                                        label="Total Volume"
                                                        value={`${remainingQuantity.totalVolume} m³`}
                                                    />
                                                    <StatusItem
                                                        label="Planned Volume"
                                                        value={`${remainingQuantity.totalPlannedVolume} m³`}
                                                    />
                                                    <StatusItem
                                                        label="Remaining Volume"
                                                        value={`${remainingQuantity.remainingVolume} m³`}
                                                    />
                                                    <StatusItem
                                                        label="Volume Progress"
                                                        value={`${remainingQuantity.completionPercentageVolume}%`}
                                                    />
                                                </div>
                                            )}
                                            {/* Planning Fields */}
                                            {selectedElement && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="planned_amount">
                                                            Planned Amount
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                (Required: {selectedElement.required_amount})
                                                            </span>
                                                        </Label>
                                                        <Controller
                                                            name="planned_amount"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div className="space-y-1">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const amount = parseInt(e.target.value);
                                                                            field.onChange(amount);
                                                                            if (selectedElement) {
                                                                                const volume = amount * parseFloat(selectedElement.volume);
                                                                                setValue('planned_volume', volume);

                                                                                // Add validation warning
                                                                                if (amount > selectedElement.required_amount) {
                                                                                    toast({
                                                                                        title: "Warning",
                                                                                        description: `Planned amount exceeds required amount of ${selectedElement.required_amount}`,
                                                                                        variant: "warning",
                                                                                    });
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {field.value > selectedElement.required_amount && (
                                                                        <p className="text-amber-600 text-sm">
                                                                            Exceeds required amount by {field.value - selectedElement.required_amount}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="planned_volume">Calculated Volume (m³)</Label>
                                                        <Controller
                                                            name="planned_volume"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    disabled
                                                                    className="bg-gray-50"
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Planned Castings Table */}
                                            <div className="mt-6">
                                                <Label className="block mb-2">Today&apos;s Planned Castings</Label>
                                                <PlannedCastingsTable
                                                    plannedCastings={plannedCastings}
                                                    elements={elements}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notes" className="space-y-6 pt-4">
                                        <div className="space-y-6">
                                            {/* MEP Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-black">MEP Installation</Label>
                                                <div className="flex gap-4 mt-2">
                                                    <Controller
                                                        name="mep"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="radio"
                                                                        id="mep-yes"
                                                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                                        checked={field.value === 'MEP'}
                                                                        onChange={() => field.onChange('MEP')}
                                                                    />
                                                                    <Label
                                                                        htmlFor="mep-yes"
                                                                        className="text-sm font-medium text-gray-700 cursor-pointer"
                                                                    >
                                                                        Yes
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="radio"
                                                                        id="mep-no"
                                                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                                        checked={field.value === 'NO'}
                                                                        onChange={() => field.onChange('NO')}
                                                                    />
                                                                    <Label
                                                                        htmlFor="mep-no"
                                                                        className="text-sm font-medium text-gray-700 cursor-pointer"
                                                                    >
                                                                        No
                                                                    </Label>
                                                                </div>
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* RFT Source Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-black">RFT Source</Label>
                                                <Controller
                                                    name="rft"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="space-y-2">
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    field.onChange(value);
                                                                    if (value !== 'OTHER') {
                                                                        setValue('customRftSource', undefined);
                                                                    }
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <SelectTrigger className="border-emerald-200">
                                                                    <SelectValue placeholder="Select RFT Source" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="ACT">ACT</SelectItem>
                                                                    <SelectItem value="HAMDAN">Hamdan</SelectItem>
                                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FieldError error={errors.rft} />
                                                        </div>
                                                    )}
                                                />

                                                {/* Custom RFT Source Input */}
                                                {watch('rft') === 'OTHER' && (
                                                    <div className="mt-2">
                                                        <Controller
                                                            name="customRftSource"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div className="space-y-1">
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter custom RFT source..."
                                                                        className="border-emerald-200"
                                                                    />
                                                                    <FieldError error={errors.customRftSource} />
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Remarks Section */}
                                            <div className="space-y-4">
                                                <Label className="text-black">Remarks</Label>
                                                <Controller
                                                    name="remarkType"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="space-y-2">
                                                            {/* Cast as Planned */}
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    id="remark-planned"
                                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                                    checked={field.value === 'PLANNED'}
                                                                    onChange={() => {
                                                                        field.onChange('PLANNED');
                                                                        setValue('customRemark', '');
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="remark-planned"
                                                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                                                >
                                                                    {PREDEFINED_REMARKS.PLANNED}
                                                                </Label>
                                                            </div>

                                                            {/* Not Done */}
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    id="remark-not-done"
                                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                                    checked={field.value === 'NOT_DONE'}
                                                                    onChange={() => {
                                                                        field.onChange('NOT_DONE');
                                                                        setValue('customRemark', '');
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="remark-not-done"
                                                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                                                >
                                                                    {PREDEFINED_REMARKS.NOT_DONE}
                                                                </Label>
                                                            </div>

                                                            {/* Advanced */}
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    id="remark-advance"
                                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                                    checked={field.value === 'ADVANCED'}
                                                                    onChange={() => {
                                                                        field.onChange('ADVANCED');
                                                                        setValue('customRemark', '');
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor="remark-advance"
                                                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                                                >
                                                                    {PREDEFINED_REMARKS.ADVANCED}
                                                                </Label>
                                                            </div>

                                                            {/* Custom Option */}
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    id="remark-custom"
                                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                                                    checked={field.value === 'CUSTOM'}
                                                                    onChange={() => field.onChange('CUSTOM')}
                                                                />
                                                                <Label
                                                                    htmlFor="remark-custom"
                                                                    className="text-sm font-medium text-gray-700 cursor-pointer"
                                                                >
                                                                    Custom Remark
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    )}
                                                />

                                                {/* Custom Remark Input */}
                                                {remarkType === 'CUSTOM' && (
                                                    <div className="pl-6">
                                                        <Controller
                                                            name="customRemark"
                                                            control={control}
                                                            rules={{ required: remarkType === 'CUSTOM' }}
                                                            render={({ field }) => (
                                                                <Textarea
                                                                    {...field}
                                                                    placeholder="Enter your custom remark..."
                                                                    className="min-h-[100px] border-emerald-200 mt-2"
                                                                />
                                                            )}
                                                        />
                                                        {remarkType === 'CUSTOM' && !watch('customRemark') && (
                                                            <p className="text-red-500 text-sm mt-1">
                                                                Custom remark is required
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Form Actions */}
                                <div className="flex justify-between items-center pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prepareNewRecord}
                                        className="border-emerald-200"
                                    >
                                        Clear Form
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isEditing ? 'Update Record' : 'Add Record'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </>
                )}
            </Card>

            {/* Records Table */}
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Added Records</CardTitle>
                    <Button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting || savedRecords.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Submitting...
                            </>
                        ) : (
                            `Submit All Records (${savedRecords.length})`
                        )}
                    </Button>
                </CardHeader>
                <CardContent>
                    <DailyReportTable
                        records={savedRecords}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

// Helper components
const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
    if (!error?.message) return null;
    return (
        <div className="flex items-center mt-1 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error.message}</span>
        </div>
    );
};

const StatusItem: React.FC<StatusItemProps> = ({ label, value, className }) => (
    <div className="space-y-1">
        <Label className="text-emerald-700">{label}</Label>
        <p className={`font-medium ${className || ''}`}>{value}</p>
    </div>
);

const PlannedCastingsTable: React.FC<PlannedCastingsTableProps> = ({ plannedCastings, elements }) => {
    if (plannedCastings.length === 0) {
        return (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No planned castings for today</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Element</TableHead>
                        <TableHead>Required Amount</TableHead>
                        <TableHead>Planned Amount</TableHead>
                        <TableHead>Volume (m³)</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plannedCastings.map((casting) => {
                        const element = elements.find(e => e.id === casting.element_id);
                        return (
                            <TableRow key={casting.id}>
                                <TableCell>{element?.element_id}</TableCell>
                                <TableCell>{element?.required_amount || '-'}</TableCell>
                                <TableCell>{casting.planned_amount}</TableCell>
                                <TableCell>{casting.planned_volume}</TableCell>
                                <TableCell>
                                    {new Date(casting.planned_date).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
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