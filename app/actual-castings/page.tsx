'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { format } from 'date-fns'
import Layout from '@/components/Layout'

interface DailyReport {
    id: number;
    date: string;
    job_number: string;
    table_number: string;
    element_id: string;
    planned_to_cast: number;
    casted_today: number;
    remaining_quantity: number;
    status: 'pending' | 'in_progress' | 'completed';
}

interface ActualCasting {
    report_id: number;
    casted_amount: number;
}

export default function ActualCastingPage() {
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
    const { control, handleSubmit, setValue } = useForm<ActualCasting>()

    useEffect(() => {
        fetchDailyReports()
    }, [])

    const fetchDailyReports = async () => {
        const response = await fetch('/api/daily-reports/today')
        if (response.ok) {
            const data = await response.json()
            setDailyReports(data)
        }
    }

    const onSubmit = async (data: ActualCasting) => {
        try {
            const response = await fetch('/api/actual-castings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Actual casting has been recorded.",
                })
                fetchDailyReports() // Refresh the list
            } else {
                throw new Error('Failed to record actual casting')
            }
        } catch (error) {
            console.error('Error recording actual casting:', error)
            toast({
                title: "Error",
                description: "Failed to record actual casting. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <Layout>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Today&apos;s Casting Tasks</h1>
                {dailyReports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader>
                            <CardTitle>{report.job_number} - {report.element_id}</CardTitle>
                            <CardDescription>Table: {report.table_number} | Date: {format(new Date(report.date), 'PPP')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Planned: {report.planned_to_cast}</p>
                            <p>Casted Today: {report.casted_today}</p>
                            <p>Remaining: {report.remaining_quantity}</p>
                            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                                <input type="hidden" name="report_id" value={report.id} />
                                <div className="space-y-2">
                                    <Label htmlFor={`casted_amount_${report.id}`}>Casted Amount</Label>
                                    <Controller
                                        name="casted_amount"
                                        control={control}
                                        defaultValue={0}
                                        rules={{ required: true, min: 0, max: report.remaining_quantity }}
                                        render={({ field }) => (
                                            <Input
                                                id={`casted_amount_${report.id}`}
                                                type="number"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(Number(e.target.value))
                                                    setValue('report_id', report.id)
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="mt-2 bg-green-600 hover:bg-green-700 mr-2">Record Casting</Button>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <p>Status: {report.status}</p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </Layout>
    )
}