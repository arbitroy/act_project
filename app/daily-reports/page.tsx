'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Plus, Search, AlertCircle, FileSpreadsheet, Filter } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface DailyReport {
    id: string
    date: string
    job_number: string
    table_number: string
    element_id: string
    planned_volume: number | null
    planned_weight: number | null
    mep: string
    remarks: string
    status: string
}

interface FilterSelectProps {
    value: string
    onValueChange: (value: string) => void
    options: string[]
    placeholder: string
}

const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        approved: "bg-green-100 text-green-800 border-green-200",
        rejected: "bg-red-100 text-red-800 border-red-200"
    }
    
    return (
        <Badge variant="outline" className={`${statusStyles[status as keyof typeof statusStyles]} px-2 py-1`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    )
}

const FilterSelect = ({ value, onValueChange, options, placeholder }: FilterSelectProps) => {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-10">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectItem value="all">All {placeholder}s</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default function DailyReportListView() {
    const router = useRouter()
    const { user } = useAuth()
    const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterJob, setFilterJob] = useState('all')
    const [filterTable, setFilterTable] = useState('all')
    const [jobs, setJobs] = useState<string[]>([])
    const [tables, setTables] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchDailyReports = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const response = await fetch(`/api/daily-reports?page=${currentPage}&search=${searchTerm}&job=${filterJob === 'all' ? '' : filterJob}&table=${filterTable === 'all' ? '' : filterTable}`)
            if (response.ok) {
                const data = await response.json()
                setDailyReports(data.reports)
                setTotalPages(data.totalPages)
            } else {
                throw new Error('Failed to fetch daily reports')
            }
        } catch (error) {
            setError('Error loading daily reports')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, filterJob, filterTable, searchTerm])

    useEffect(() => {
        fetchDailyReports()
        fetchJobsAndTables()
    }, [currentPage, searchTerm, filterJob, filterTable, fetchDailyReports])

    const fetchJobsAndTables = async () => {
        try {
            const [jobsResponse, tablesResponse] = await Promise.all([
                fetch('/api/jobs'),
                fetch('/api/tables')
            ])
            if (jobsResponse.ok && tablesResponse.ok) {
                const jobsData = await jobsResponse.json()
                const tablesData = await tablesResponse.json()
                setJobs(jobsData.map((job: { job_number: string }) => job.job_number))
                setTables(tablesData.map((table: { table_number: string }) => table.table_number))
            }
        } catch (error) {
            setError('Error loading filters')
            console.error(error)
        }
    }

    const handleCreateReport = () => {
        router.push('/daily-report')
    }

    const handleExportToExcel = () => {
        // Implement Excel export functionality
        toast({
            title: "Export Started",
            description: "Your report is being generated...",
        })
    }

    const handleStatusChange = async (reportId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/daily-reports`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: reportId, status: newStatus }),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Report status updated successfully",
                })
                fetchDailyReports()
            } else {
                throw new Error('Failed to update report status')
            }
        } catch (error) {
            console.error('Error updating report status:', error)
            toast({
                title: "Error",
                description: "Failed to update report status",
                variant: "destructive",
            })
        }
    }

    const formatNumber = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return 'N/A'
        // Convert string to number if needed and check if it's a valid number
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        return isNaN(numValue) ? 'N/A' : numValue.toFixed(2)
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold">Daily Reports</CardTitle>
                                <CardDescription>Manage and track your daily casting reports</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleExportToExcel}
                                    variant="outline"
                                    className="bg-white hover:bg-gray-50"
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export
                                </Button>
                                {user?.role === 'planned_employee' && (
                                    <Button onClick={handleCreateReport} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="mr-2 h-4 w-4" /> Create Report
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            type="text"
                                            placeholder="Search by job number, table, or element ID..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:w-2/5">
                                    <div className="flex-1">
                                        <FilterSelect
                                            value={filterJob}
                                            onValueChange={(value) => {
                                                setFilterJob(value)
                                                setCurrentPage(1)
                                            }}
                                            options={jobs}
                                            placeholder="Job"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <FilterSelect
                                            value={filterTable}
                                            onValueChange={(value) => {
                                                setFilterTable(value)
                                                setCurrentPage(1)
                                            }}
                                            options={tables}
                                            placeholder="Table"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="rounded-lg border shadow-sm overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>Date</TableHead>
                                            <TableHead>Job No.</TableHead>
                                            <TableHead>Table No.</TableHead>
                                            <TableHead>Element ID</TableHead>
                                            <TableHead className="text-right">Planned Volume</TableHead>
                                            <TableHead className="text-right">Planned Weight</TableHead>
                                            <TableHead>MEP</TableHead>
                                            <TableHead>Remarks</TableHead>
                                            <TableHead>Status</TableHead>
                                            {user?.role === 'manager' && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={i}>
                                                    {[...Array(9)].map((_, j) => (
                                                        <TableCell key={j}>
                                                            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : dailyReports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Filter className="h-8 w-8 text-gray-400" />
                                                        <p className="text-gray-500">No reports found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            dailyReports.map((report) => (
                                                <TableRow key={report.id} className="hover:bg-gray-50">
                                                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{report.job_number}</TableCell>
                                                    <TableCell>{report.table_number}</TableCell>
                                                    <TableCell>{report.element_id}</TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {formatNumber(report.planned_volume)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {formatNumber(report.planned_weight)}
                                                    </TableCell>
                                                    <TableCell>{report.mep}</TableCell>
                                                    <TableCell>
                                                        <span className="truncate max-w-[200px] block">
                                                            {report.remarks}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={report.status} />
                                                    </TableCell>
                                                    {user?.role === 'manager' && (
                                                        <TableCell>
                                                            <Select
                                                                value={report.status}
                                                                onValueChange={(value) => handleStatusChange(report.id, value)}
                                                            >
                                                                <SelectTrigger className="w-[130px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="approved">Approved</SelectItem>
                                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <Pagination>
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}