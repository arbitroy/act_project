'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Plus, Search } from 'lucide-react'

interface DailyReport {
    id: string
    date: string
    job_number: string
    table_number: string
    element_id: string
    already_casted: number
    remaining_quantity: number
    planned_to_cast: number
    planned_volume: number
}

export default function DailyReportListView() {
    const router = useRouter()
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterJob, setFilterJob] = useState('')
    const [filterTable, setFilterTable] = useState('')
    const [jobs, setJobs] = useState<string[]>([])
    const [tables, setTables] = useState<string[]>([])

    const fetchDailyReports = async () => {
        try {
            const response = await fetch(`/api/daily-reports?page=${currentPage}&search=${searchTerm}&job=${filterJob}&table=${filterTable}`)
            if (response.ok) {
                const data = await response.json()
                setDailyReports(data.reports)
                setTotalPages(data.totalPages)
            } else {
                console.error('Failed to fetch daily reports')
            }
        } catch (error) {
            console.error('Error fetching daily reports:', error)
        }
    }

    const fetchJobsAndTables = async () => {
        try {
            const [jobsResponse, tablesResponse] = await Promise.all([
                fetch('/api/jobs'),
                fetch('/api/tables')
            ])
            if (jobsResponse.ok && tablesResponse.ok) {
                const jobsData = await jobsResponse.json()
                const tablesData = await tablesResponse.json()
                setJobs(jobsData.map((job: any) => job.job_number))
                setTables(tablesData.map((table: any) => table.table_number))
            } else {
                console.error('Failed to fetch jobs or tables')
            }
        } catch (error) {
            console.error('Error fetching jobs and tables:', error)
        }
    }

    useEffect(() => {
        fetchDailyReports()
        fetchJobsAndTables()
    }, [currentPage, searchTerm, filterJob, filterTable])

    const handleCreateReport = () => {
        router.push('/daily-report')
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleFilterJob = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterJob(e.target.value)
        setCurrentPage(1)
    }

    const handleFilterTable = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterTable(e.target.value)
        setCurrentPage(1)
    }

    return (
        <Layout>
            <Card className="w-full max-w-6xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-green-800">Daily Reports</CardTitle>
                    <Button onClick={handleCreateReport} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> Create Daily Report
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <Select value={filterJob} onChange={handleFilterJob} className="w-full md:w-48">
                            <option value="">All Jobs</option>
                            {jobs.map((job) => (
                                <option key={job} value={job}>{job}</option>
                            ))}
                        </Select>
                        <Select value={filterTable} onChange={handleFilterTable} className="w-full md:w-48">
                            <option value="">All Tables</option>
                            {tables.map((table) => (
                                <option key={table} value={table}>{table}</option>
                            ))}
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Job No.</TableHead>
                                <TableHead>Table No.</TableHead>
                                <TableHead>Element ID</TableHead>
                                <TableHead>Already Casted</TableHead>
                                <TableHead>Remaining Quantity</TableHead>
                                <TableHead>Planned to Cast</TableHead>
                                <TableHead>Planned Volume</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dailyReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{report.job_number}</TableCell>
                                    <TableCell>{report.table_number}</TableCell>
                                    <TableCell>{report.element_id}</TableCell>
                                    <TableCell>{report.already_casted}</TableCell>
                                    <TableCell>{report.remaining_quantity}</TableCell>
                                    <TableCell>{report.planned_to_cast}</TableCell>
                                    <TableCell>{report.planned_volume}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination className="mt-6">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(i + 1)}
                                        isActive={currentPage === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardContent>
            </Card>
        </Layout>
    )
}