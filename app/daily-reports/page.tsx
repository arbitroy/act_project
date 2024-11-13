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
import { Plus, Search, AlertCircle, FileSpreadsheet, Filter, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { randomBytes } from 'crypto'


interface DailyReport {
    id: string
    date: string
    job_number: string
    table_number: string
    element_code: string
    element_volume: number
    already_casted: number
    already_casted_volume: number
    remaining_qty: number
    required_amount: number
    planned_volume: number
    planned_amount: number
    actual_casted: number
    actual_volume: number
    mep: string
    rft: string
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
        in_progress: "bg-blue-100 text-blue-800 border-blue-200",
        completed: "bg-green-100 text-green-800 border-green-200"
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
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
    const [jobs, setJobs] = useState<string[]>([])
    const [tables, setTables] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [pdfExportOption, setPdfExportOption] = useState('current')

    const fetchDailyReports = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const response = await fetch(`/api/daily-reports?page=${currentPage}&search=${searchTerm}&job=${filterJob === 'all' ? '' : filterJob}&table=${filterTable === 'all' ? '' : filterTable}&date=${filterDate}`)
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
    }, [currentPage, filterJob, filterTable, filterDate, searchTerm])

    useEffect(() => {
        fetchDailyReports()
        fetchJobsAndTables()
    }, [currentPage, searchTerm, filterJob, filterTable, filterDate, fetchDailyReports])

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
        if (user?.id) {
            router.push(`/daily-report?userId=${user.id}`)
        } else {
            toast({
                title: "Error",
                description: "User not authenticated",
                variant: "destructive",
            })
        }
    }


    const generateUniqueId = () => {
        // Generate a 4-character hex string
        return randomBytes(2).toString('hex');
    };

    
    const handleExportToPDF = async () => {
        try {
            // First fetch the data
            let fetchUrl = `/api/daily-reports?page=1&limit=-1`;
            if (pdfExportOption === 'current') {
                fetchUrl += `&date=${filterDate}`;
            }

            const dataResponse = await fetch(fetchUrl);
            if (!dataResponse.ok) throw new Error('Failed to fetch data');

            const data = await dataResponse.json();

            const uniqueId = generateUniqueId();

            // Then send the data to PDF generation endpoint
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reports: data.reports,
                    date: filterDate,
                }),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            // Get the blob from the response
            const blob = await response.blob();

            // Create a URL for the blob
            const downloadUrl = window.URL.createObjectURL(blob);

            // Create a temporary link and click it to download
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `daily-report-${filterDate}-${uniqueId}.pdf`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast({
                title: "Success",
                description: "PDF generated successfully",
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Error",
                description: "Failed to generate PDF",
                variant: "destructive",
            });
        }
    };

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
                                <Select
                                    value={pdfExportOption}
                                    onValueChange={setPdfExportOption}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select PDF export option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="current">Current Date</SelectItem>
                                        <SelectItem value="all">All Dates</SelectItem>
                                    </SelectContent>
                                </Select>
                                {user?.role === 'manager' && (
                                    <Button
                                        onClick={handleExportToPDF}
                                        variant="outline"
                                        className="bg-white hover:bg-gray-50"
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export PDF
                                    </Button>
                                )}
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
                                <div className="flex flex-col md:flex-row gap-4 md:w-3/5">
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
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) => {
                                                    setFilterDate(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                                className="pl-10"
                                            />
                                        </div>
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
                                            <TableHead>S/N</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Job No.</TableHead>
                                            <TableHead>Table No.</TableHead>
                                            <TableHead>Element ID</TableHead>
                                            <TableHead className="text-right">Already Casted Amount(nos)</TableHead>
                                            <TableHead className="text-right">Already Casted Volume (m3)</TableHead>
                                            <TableHead className="text-right">Remaining Qty (nos)</TableHead>
                                            <TableHead className="text-right">Total Required (nos)</TableHead>
                                            <TableHead className="text-right">Element Volume (m³)</TableHead>
                                            <TableHead className="text-right">Total Required Volume (m³)</TableHead>
                                            <TableHead className="text-right">Weight (kg)</TableHead>
                                            <TableHead className="text-right">Planned to Cast (nos)</TableHead>
                                            <TableHead className="text-right">Planned Volume (m3)</TableHead>
                                            <TableHead className="text-right">Actual Casted (nos)</TableHead>
                                            <TableHead className="text-right">Actual Volume (m3)</TableHead>
                                            <TableHead>MEP</TableHead>
                                            <TableHead>RFT Source</TableHead>
                                            <TableHead>Remarks</TableHead>
                                            <TableHead>Status</TableHead>
                                            {user?.role === 'manager' && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={`loading-row-${i}`}>
                                                    {[...Array(20)].map((_, j) => (
                                                        <TableCell key={`loading-cell-${i}-${j}`}>
                                                            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : dailyReports.length === 0 ?(
                                            <TableRow>
                                                <TableCell colSpan={21} className="text-center py-8">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Filter className="h-8 w-8 text-gray-400" />
                                                        <p className="text-gray-500">No reports found for the selected date</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            dailyReports.map((report, index) => (
                                        <TableRow key={`${report.id}-${index}`} className="hover:bg-gray-50">
                                            <TableCell>{report.id}</TableCell>
                                            <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{report.job_number}</TableCell>
                                            <TableCell>{report.table_number}</TableCell>
                                            <TableCell>{report.element_code}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.already_casted)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.already_casted_volume)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.remaining_qty)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.required_amount)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.element_volume)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.required_amount * report.element_volume)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.element_volume * 2.5)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.planned_amount)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.planned_volume)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.actual_casted)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatNumber(report.actual_volume)}
                                            </TableCell>
                                            <TableCell>{report.mep}</TableCell>
                                            <TableCell>{report.rft}</TableCell>
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
                                                            <SelectItem value="in_progress">In progress</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
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