'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Job {
    jobno: string;  // Changed from jobNo to jobno
    description: string;
}

export default function JobsManagement() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [newJob, setNewJob] = useState<Job>({ jobno: '', description: '' })
    const [editingJob, setEditingJob] = useState<Job | null>(null)
    const token = localStorage.getItem('token');

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch('/api/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setJobs(data)
            } else {
                console.error('Failed to fetch jobs:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching jobs:', error)
        }
    }, [token])

    useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newJob),
            })
            if (response.ok) {
                setNewJob({ jobno: '', description: '' })
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
            const response = await fetch('/api/jobs', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    const handleDelete = async (jobno: string) => {
        try {
            const response = await fetch('/api/jobs', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobno }),
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
        <div>
            <h3 className="text-lg font-semibold mb-4">Jobs Management</h3>
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Job No"
                    value={newJob.jobno}
                    onChange={(e) => setNewJob({ ...newJob, jobno: e.target.value })}
                />
                <Input
                    placeholder="Description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
                <Button onClick={handleCreate}>Add Job</Button>
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
                    {jobs.map((job) => job && (
                        <TableRow key={job.jobno}>
                            <TableCell>{job.jobno}</TableCell>
                            <TableCell>
                                {editingJob?.jobno === job.jobno ? (
                                    <Input
                                        value={editingJob.description}
                                        onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                                    />
                                ) : (
                                    job.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editingJob?.jobno === job.jobno ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingJob(job)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(job.jobno)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}