'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Plus, Search, Filter, AlertCircle } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'

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

interface FilterSelectProps {
    value: string
    onValueChange: (value: string) => void
    options: string[]
    placeholder: string
}

const FilterSelect = ({ value, onValueChange, options, placeholder }: FilterSelectProps) => {
    // Convert between UI value and internal value
    const internalValue = value || 'all'
    const handleValueChange = (newValue: string) => {
        onValueChange(newValue === 'all' ? '' : newValue)
    }

    return (
        <Select.Root value={internalValue} onValueChange={handleValueChange}>
            <Select.Trigger 
                className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label={placeholder}
            >
                <Select.Value placeholder={placeholder}>
                    {value || `All ${placeholder}s`}
                </Select.Value>
                <Select.Icon>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content 
                    className="overflow-hidden bg-white dark:bg-gray-800 rounded-md shadow-lg"
                    position="popper"
                    sideOffset={5}
                >
                    <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-800 cursor-default">
                        <ChevronUpIcon />
                    </Select.ScrollUpButton>
                    
                    <Select.Viewport className="p-1">
                        <Select.Group>
                            <Select.Item 
                                value="all"
                                className="relative flex items-center h-8 px-6 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700"
                            >
                                <Select.ItemText>All {placeholder}s</Select.ItemText>
                            </Select.Item>
                            
                            {options.map((option) => (
                                <Select.Item
                                    key={option}
                                    value={option}
                                    className="relative flex items-center h-8 px-6 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700"
                                >
                                    <Select.ItemText>{option}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Group>
                    </Select.Viewport>

                    <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-800 cursor-default">
                        <ChevronDownIcon />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchDailyReports = async () => {
        setIsLoading(true)
        setError('')
        try {
            const response = await fetch(`/api/daily-reports?page=${currentPage}&search=${searchTerm}&job=${filterJob}&table=${filterTable}`)
            if (response.ok) {
                const data = await response.json()
                setDailyReports(data.reports)
                setTotalPages(data.totalPages)
            } else {
                setError('Failed to fetch daily reports')
            }
        } catch (error) {
            setError(`Error loading daily reports:${error} `)
        } finally {
            setIsLoading(false)
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
            }
        } catch (error) {
            setError('Error loading filters')
        }
    }

    useEffect(() => {
        fetchDailyReports()
        fetchJobsAndTables()
    }, [currentPage, searchTerm, filterJob, filterTable])

    const handleCreateReport = () => {
        router.push('/daily-report')
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Daily Reports</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage and track your daily casting reports
                            </p>
                        </div>
                        <Button 
                            onClick={handleCreateReport} 
                            className="bg-green-600 hover:bg-green-700 shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create Report
                        </Button>
                    </div>

                    {/* Enhanced Filters Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
                                <Filter className="h-5 w-5" />
                                Search and Filter Reports
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="relative md:col-span-6">
                                    <Input
                                        type="text"
                                        placeholder="Search by job number, table, or element ID..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="pl-10 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                                <div className="md:col-span-3">
                                    <FilterSelect
                                        value={filterJob}
                                        onValueChange={(value) => {
                                            setFilterJob(value)
                                            setCurrentPage(1)
                                        }}
                                        options={jobs}
                                        placeholder="Select Job"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <FilterSelect
                                        value={filterTable}
                                        onValueChange={(value) => {
                                            setFilterTable(value)
                                            setCurrentPage(1)
                                        }}
                                        options={tables}
                                        placeholder="Select Table"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Table Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-900">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Job No.</TableHead>
                                        <TableHead>Table No.</TableHead>
                                        <TableHead>Element ID</TableHead>
                                        <TableHead className="text-right">Already Casted</TableHead>
                                        <TableHead className="text-right">Remaining</TableHead>
                                        <TableHead className="text-right">Planned</TableHead>
                                        <TableHead className="text-right">Volume</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <TableRow key={i}>
                                                {[...Array(8)].map((_, j) => (
                                                    <TableCell key={j}>
                                                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : dailyReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={8} 
                                                className="text-center py-8 text-gray-500"
                                            >
                                                No reports found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        dailyReports.map((report) => (
                                            <TableRow 
                                                key={report.id} 
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/daily-report/${report.id}`)}
                                            >
                                                <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="font-medium">{report.job_number}</TableCell>
                                                <TableCell>{report.table_number}</TableCell>
                                                <TableCell>{report.element_id}</TableCell>
                                                <TableCell className="text-right font-medium">{report.already_casted.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{report.remaining_quantity.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{report.planned_to_cast.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{report.planned_volume.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
                    </div>
                </div>
            </div>
        </Layout>
    )
}