'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Job {
    job_number: string;
    description: string;
}

export default function JobsManagement() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [newJob, setNewJob] = useState<Job>({ job_number: '', description: '' })
    const [editingJob, setEditingJob] = useState<Job | null>(null)

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch('/api/jobs')
            if (response.ok) {
                const data = await response.json()
                setJobs(data)
            } else {
                console.error('Failed to fetch jobs:', response.statusText)

            }
        } catch (error) {
            console.error('Error fetching jobs:', error)

        }
    }, [])

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
                body: JSON.stringify(newJob),
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
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Jobs Management</h3>
            <div className="flex gap-4">
                <Input
                    placeholder="Job No"
                    value={newJob.job_number}
                    onChange={(e) => setNewJob({ ...newJob, job_number: e.target.value })}
                    className="flex-1"
                />
                <Input
                    placeholder="Description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="flex-1"
                />
                <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Add Job</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job No</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.map((job) => (
                        <TableRow key={job.job_number}>
                            <TableCell>{job.job_number}</TableCell>
                            <TableCell>
                                {editingJob && editingJob.job_number === job.job_number ? (
                                    <Input
                                        value={editingJob.description}
                                        onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                                    />
                                ) : (
                                    job.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editingJob && editingJob.job_number === job.job_number ? (
                                    <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 mr-2">Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingJob(job)} className="bg-blue-600 hover:bg-blue-700 mr-2">Edit</Button>
                                )}
                                <Button className="bg-red-600 hover:bg-red-700 mr-2" onClick={() => handleDelete(job.job_number)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}