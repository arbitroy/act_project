'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Job {
    job_number: string;
    description: string;
}
interface JobsManagementProps {
    projectId: string | string[]
}
export default function JobsManagement({ projectId }: JobsManagementProps) {
    const [jobs, setJobs] = useState<Job[]>([])
    const [newJob, setNewJob] = useState<Job>({ job_number: '', description: '' })
    const [editingJob, setEditingJob] = useState<Job | null>(null)

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch(`/api/jobs?projectId=${projectId}`)
            if (response.ok) {
                const data = await response.json()
                setJobs(data)
            } else {
                console.error('Failed to fetch jobs:', response.statusText)

            }
        } catch (error) {
            console.error('Error fetching jobs:', error)

        }
    }, [projectId])

    useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newJob,
                    project_id: projectId
                }),
            })
            if (response.ok) {
                setNewJob({ job_number: '', description: '' })
                fetchJobs()

            } else {
                console.error('Failed to create job:', response.statusText)

            }
        } catch (error) {
            console.error('Error creating job:', error)

        }
    }

    const handleUpdate = async () => {
        if (!editingJob) return
        try {
            const response = await fetch('/api/jobs/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingJob),
            })
            if (response.ok) {
                setEditingJob(null)
                fetchJobs()
            } else {
                console.error('Failed to update job:', response.statusText)

            }
        } catch (error) {
            console.error('Error updating job:', error)

        }
    }

    const handleDelete = async (job_number: string) => {
        try {
            const response = await fetch(`/api/jobs/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ job_number })
            })
            if (response.ok) {
                fetchJobs()
            } else {
                console.error('Failed to delete job:', response.statusText)

            }
        } catch (error) {
            console.error('Error deleting job:', error)

        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Jobs Management</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Creation Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="job-number" className="text-sm font-medium text-gray-700">
                            Job Number
                        </Label>
                        <Input
                            id="job-number"
                            placeholder="Enter Job Number"
                            value={newJob.job_number}
                            onChange={(e) => setNewJob({ ...newJob, job_number: e.target.value })}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Unique identifier for the job
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Description
                        </Label>
                        <Input
                            id="description"
                            placeholder="Enter job description"
                            value={newJob.description}
                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Brief description of the job
                        </p>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <Button 
                            onClick={handleCreate} 
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Add Job
                        </Button>
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Job Number</TableHead>
                                <TableHead className="font-semibold">Description</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.job_number}>
                                    <TableCell>{job.job_number}</TableCell>
                                    <TableCell>
                                        {editingJob && editingJob.job_number === job.job_number ? (
                                            <div className="space-y-1">
                                                <Label htmlFor={`edit-description-${job.job_number}`} className="sr-only">
                                                    Description
                                                </Label>
                                                <Input
                                                    id={`edit-description-${job.job_number}`}
                                                    value={editingJob.description}
                                                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                                                />
                                            </div>
                                        ) : (
                                            job.description
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {editingJob && editingJob.job_number === job.job_number ? (
                                                <Button 
                                                    onClick={handleUpdate} 
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button 
                                                    onClick={() => setEditingJob(job)} 
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            <Button 
                                                className="bg-red-600 hover:bg-red-700" 
                                                onClick={() => handleDelete(job.job_number)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}