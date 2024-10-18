'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Job {
    jobNo: string
    description: string
}

export default function JobsManagement() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [newJob, setNewJob] = useState<Job>({ jobNo: '', description: '' })
    const [editingJob, setEditingJob] = useState<Job | null>(null)
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        const response = await fetch('/api/jobs')
        if (response.ok) {
            const data = await response.json()
            setJobs(data)
        }
    }

    const handleCreate = async () => {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newJob),
        })
        if (response.ok) {
            setNewJob({ jobNo: '', description: '' })
            fetchJobs()
        }
    }

    const handleUpdate = async () => {
        if (!editingJob) return
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
        }
    }

    const handleDelete = async (jobNo: string) => {
        const response = await fetch('/api/jobs', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ jobNo }),
        })
        if (response.ok) {
            fetchJobs()
        }
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Jobs Management</h3>
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Job No"
                    value={newJob.jobNo}
                    onChange={(e) => setNewJob({ ...newJob, jobNo: e.target.value })}
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
                    {jobs.map((job) => (
                        <TableRow key={job.jobNo}>
                            <TableCell>{job.jobNo}</TableCell>
                            <TableCell>
                                {editingJob?.jobNo === job.jobNo ? (
                                    <Input
                                        value={editingJob.description}
                                        onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                                    />
                                ) : (
                                    job.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editingJob?.jobNo === job.jobNo ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingJob(job)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(job.jobNo)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}