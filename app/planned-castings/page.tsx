'use client'

import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

// Define interfaces for our data types
interface Job {
    id: number
    job_number: string
    description: string
}

interface Table {
    id: number
    table_number: string
    description: string
}

interface Element {
    id: number
    element_id: string
    volume: number
    weight: number
}

interface FormData {
    date: string
    job_id: string
    table_id: string
    element_id: string
    planned_to_cast: string
}

interface FormErrors {
    date?: string
    job_id?: string
    table_id?: string
    element_id?: string
    planned_to_cast?: string
}

interface SubmissionData extends Omit<FormData, 'planned_to_cast'> {
    planned_to_cast: number
    status: 'pending'
    casted_today: number
    remaining_quantity: number
}

const PlannedCastingPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        date: '',
        job_id: '',
        table_id: '',
        element_id: '',
        planned_to_cast: ''
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [jobs, setJobs] = useState<Job[]>([])
    const [tables, setTables] = useState<Table[]>([])
    const [elements, setElements] = useState<Element[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, tablesRes, elementsRes] = await Promise.all([
                    fetch('/api/jobs'),
                    fetch('/api/tables'),
                    fetch('/api/elements')
                ])

                if (!jobsRes.ok || !tablesRes.ok || !elementsRes.ok) {
                    throw new Error('Failed to fetch data')
                }

                const [jobsData, tablesData, elementsData] = await Promise.all([
                    jobsRes.json() as Promise<Job[]>,
                    tablesRes.json() as Promise<Table[]>,
                    elementsRes.json() as Promise<Element[]>
                ])

                setJobs(jobsData)
                setTables(tablesData)
                setElements(elementsData)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [])

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.date) newErrors.date = 'Date is required'
        if (!formData.job_id) newErrors.job_id = 'Job is required'
        if (!formData.table_id) newErrors.table_id = 'Table is required'
        if (!formData.element_id) newErrors.element_id = 'Element is required'
        if (!formData.planned_to_cast) {
            newErrors.planned_to_cast = 'Planned casting amount is required'
        } else if (Number(formData.planned_to_cast) < 1) {
            newErrors.planned_to_cast = 'Must be greater than 0'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setIsLoading(true)

            const submissionData: SubmissionData = {
                ...formData,
                planned_to_cast: Number(formData.planned_to_cast),
                status: 'pending',
                casted_today: 0,
                remaining_quantity: Number(formData.planned_to_cast),
            }

            const response = await fetch('/api/daily-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            })

            if (!response.ok) throw new Error('Failed to save planned casting')

            setFormData({
                date: '',
                job_id: '',
                table_id: '',
                element_id: '',
                planned_to_cast: ''
            })
            setErrors({})
        } catch (error) {
            console.error('Error saving planned casting:', error instanceof Error ? error.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d+$/.test(value)) {
            setFormData(prev => ({ ...prev, planned_to_cast: value }))
        }
    }

    // Get today's date in YYYY-MM-DD format for the date input min attribute
    const today = new Date().toISOString().split('T')[0]

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Casting</h2>
                            <p className="text-gray-600 mb-8">Set the planned casting for a specific date</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        min={today}
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job
                                    </label>
                                    <select
                                        value={formData.job_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, job_id: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a job</option>
                                        {jobs.map((job) => (
                                            <option key={job.id} value={job.id.toString()}>
                                                {job.job_number} - {job.description}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.job_id && <p className="mt-1 text-sm text-red-600">{errors.job_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Table
                                    </label>
                                    <select
                                        value={formData.table_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, table_id: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a table</option>
                                        {tables.map((table) => (
                                            <option key={table.id} value={table.id.toString()}>
                                                {table.table_number} - {table.description}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.table_id && <p className="mt-1 text-sm text-red-600">{errors.table_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Element
                                    </label>
                                    <select
                                        value={formData.element_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, element_id: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select an element</option>
                                        {elements.map((element) => (
                                            <option key={element.id} value={element.id.toString()}>
                                                {element.element_id} (Volume: {element.volume}, Weight: {element.weight})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.element_id && <p className="mt-1 text-sm text-red-600">{errors.element_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Planned to Cast
                                    </label>
                                    <input
                                        type="text"
                                        pattern="\d*"
                                        value={formData.planned_to_cast}
                                        onChange={handleNumberInput}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter quantity"
                                    />
                                    {errors.planned_to_cast && <p className="mt-1 text-sm text-red-600">{errors.planned_to_cast}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Saving..." : "Save Planned Casting"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PlannedCastingPage