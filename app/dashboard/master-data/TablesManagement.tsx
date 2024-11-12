'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"



interface TableData {
    table_number: string;
    description: string;
}

interface TablesManagementProps {
    projectId: string | string[]
}

export default function TablesManagement({ projectId }: TablesManagementProps) {
    const [tables, setTables] = useState<TableData[]>([])
    const [newTable, setNewTable] = useState<TableData>({ table_number: '', description: '' })
    const [editingTable, setEditingTable] = useState<TableData | null>(null)



    const fetchTables = useCallback(async () => {
        try {
            const response = await fetch(`/api/tables?projectId=${projectId}`)
            if (response.ok) {
                const data = await response.json()
                setTables(data)
            } else {
                console.error('Failed to fetch tables:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching tables:', error)
        }
    }, [projectId])

    useEffect(() => {
        fetchTables()
    }, [fetchTables])

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newTable,
                    project_id: projectId
                }),
            })
            if (response.ok) {
                setNewTable({ table_number: '', description: '' })
                fetchTables()
            } else {
                console.error('Failed to create table:', response.statusText)
            }
        } catch (error) {
            console.error('Error creating table:', error)
        }
    }

    const handleUpdate = async () => {
        if (!editingTable) return
        try {
            const response = await fetch('/api/tables', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingTable),
            })
            if (response.ok) {
                setEditingTable(null)
                fetchTables()
            } else {
                console.error('Failed to update table:', response.statusText)
            }
        } catch (error) {
            console.error('Error updating table:', error)
        }
    }

    const handleDelete = async (table_number: string) => {
        try {
            const response = await fetch('/api/tables', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ table_number }),
            })
            if (response.ok) {
                fetchTables()
            } else {
                console.error('Failed to delete table:', response.statusText)
            }
        } catch (error) {
            console.error('Error deleting table:', error)
        }
    }


    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Tables Management</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Creation Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="table-number" className="text-sm font-medium text-gray-700">
                            Table Number
                        </Label>
                        <Input
                            id="table-number"
                            placeholder="Enter Table Number"
                            value={newTable.table_number}
                            onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Unique identifier for the table
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Description
                        </Label>
                        <Input
                            id="description"
                            placeholder="Enter table description"
                            value={newTable.description}
                            onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Brief description of the table
                        </p>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <Button
                            onClick={handleCreate}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Add Table
                        </Button>
                    </div>
                </div>

                {/* Tables List */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Table Number</TableHead>
                                <TableHead className="font-semibold">Description</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tables.map((table) => table && (
                                <TableRow key={table.table_number}>
                                    <TableCell>{table.table_number}</TableCell>
                                    <TableCell>
                                        {editingTable && editingTable.table_number === table.table_number ? (
                                            <div className="space-y-1">
                                                <Label htmlFor={`edit-description-${table.table_number}`} className="sr-only">
                                                    Description
                                                </Label>
                                                <Input
                                                    id={`edit-description-${table.table_number}`}
                                                    value={editingTable.description}
                                                    onChange={(e) => setEditingTable({ ...editingTable, description: e.target.value })}
                                                />
                                            </div>
                                        ) : (
                                            table.description
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {editingTable && editingTable.table_number === table.table_number ? (
                                                <Button
                                                    onClick={handleUpdate}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => setEditingTable(table)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            <Button
                                                className="bg-red-600 hover:bg-red-700"
                                                onClick={() => handleDelete(table.table_number)}
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