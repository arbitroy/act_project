'use client'

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Layout from '@/components/Layout';
import { CalendarIcon, Loader2, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Job {
    id: number;
    job_number: string;
    description: string;
}

interface Table {
    id: number;
    table_number: string;
    description: string;
}

interface Element {
    id: number;
    element_id: string;
    volume: number;
    weight: number;
}

interface DailyReport {
    date: string;
    job_id: number;
    table_id: number;
    element_id: number;
    already_casted: number;
    remaining_quantity: number;
    planned_to_cast: number;
    planned_volume: number;
    mep: string;
    remarks: string;
}

export default function DailyReportInput() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [elements, setElements] = useState<Element[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { control, handleSubmit, watch, setValue } = useForm<DailyReport>();

    const selectedJobId = watch('job_id');
    const selectedTableId = watch('table_id');
    const selectedElementId = watch('element_id');
    const plannedToCast = watch('planned_to_cast');

    useEffect(() => {
        fetchJobs();
        fetchTables();
        fetchElements();
    }, []);

    useEffect(() => {
        if (selectedElementId) {
            const selectedElement = elements.find(e => e.id === selectedElementId);
            if (selectedElement) {
                setValue('planned_volume', selectedElement.volume * (plannedToCast || 0));
            }
        }
    }, [selectedElementId, plannedToCast, elements, setValue]);

    const fetchJobs = async () => {
        const response = await fetch('/express-api/jobs');
        if (response.ok) {
            const data = await response.json();
            setJobs(data);
        }
    }

    const fetchTables = async () => {
        const response = await fetch('/express-api/tables');
        if (response.ok) {
            const data = await response.json();
            setTables(data);
        }
    }

    const fetchElements = async () => {
        const response = await fetch('/express-api/elements');
        if (response.ok) {
            const data = await response.json();
            setElements(data);
        }
    }

    const onSubmit = async (data: DailyReport) => {
        setIsLoading(true);
        try {
            const response = await fetch('/express-api/daily-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    user_id: user?.id, // Add the user_id from the authenticated user
                }),
            });

            if (response.ok) {
                alert('Daily report submitted successfully!');
                // Reset form or redirect
            } else {
                alert('Error submitting daily report');
            }
        } catch (error) {
            console.error('Error submitting daily report:', error);
            alert('An error occurred while submitting the daily report');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Layout>
            <div className="container mx-auto p-4 bg-green-50 min-h-screen">
                <Card className="w-full max-w-4xl mx-auto shadow-lg border-green-200">
                    <CardHeader className="bg-green-100 border-b border-green-200">
                        <div className="flex items-center space-x-2">
                            <ClipboardList className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-2xl font-bold text-green-800">Daily Report Input</CardTitle>
                        </div>
                        <CardDescription className="text-green-700">Enter the details for today&apos;s production report</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-green-700">Date</Label>
                                    <div className="relative">
                                        <Controller
                                            name="date"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500 w-full"
                                                />
                                            )}
                                        />
                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="job_id" className="text-green-700">Job No.</Label>
                                    <Controller
                                        name="job_id"
                                        control={control}
                                        defaultValue={0}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full p-2 border border-green-300 rounded-md focus:border-green-500 focus:ring-green-500 bg-white"
                                            >
                                                <option value="">Select Job No.</option>
                                                {jobs.map((job) => (
                                                    <option key={job.id} value={job.id}>
                                                        {job.job_number} - {job.description}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="table_id" className="text-green-700">Table No.</Label>
                                    <Controller
                                        name="table_id"
                                        control={control}
                                        defaultValue={0}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full p-2 border border-green-300 rounded-md focus:border-green-500 focus:ring-green-500 bg-white"
                                            >
                                                <option value="">Select Table No.</option>
                                                {tables.map((table) => (
                                                    <option key={table.id} value={table.id}>
                                                        {table.table_number} - {table.description}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="element_id" className="text-green-700">Element ID</Label>
                                    <Controller
                                        name="element_id"
                                        control={control}
                                        defaultValue={0}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full p-2 border border-green-300 rounded-md focus:border-green-500 focus:ring-green-500 bg-white"
                                            >
                                                <option value="">Select Element ID</option>
                                                {elements.map((element) => (
                                                    <option key={element.id} value={element.id}>
                                                        {element.element_id} (Vol: {element.volume}, Wt: {element.weight})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>

                                {/* Numeric input fields */}
                                {['already_casted', 'remaining_quantity', 'planned_to_cast', 'planned_volume'].map((fieldName) => (
                                    <div key={fieldName} className="space-y-2">
                                        <Label htmlFor={fieldName} className="text-green-700">
                                            {fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </Label>
                                        <Controller
                                            name={fieldName as keyof DailyReport}
                                            control={control}
                                            defaultValue={0}
                                            rules={{ required: true, min: 0 }}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
                                                    readOnly={fieldName === 'planned_volume'}
                                                />
                                            )}
                                        />
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <Label htmlFor="mep" className="text-green-700">MEP</Label>
                                    <Controller
                                        name="mep"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                className="w-full border-green-300 focus:border-green-500 focus:ring-green-500"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="remarks" className="text-green-700">Remarks</Label>
                                <Controller
                                    name="remarks"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <textarea
                                            {...field}
                                            className="w-full p-2 border border-green-300 rounded-md focus:border-green-500 focus:ring-green-500"
                                            rows={3}
                                        />
                                    )}
                                />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-green-50 border-t border-green-200">
                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Daily Report'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    )
}