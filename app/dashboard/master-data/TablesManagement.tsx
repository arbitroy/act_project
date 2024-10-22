'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"



interface TableData {
    table_number: string;
    description: string;
}

export default function TablesManagement() {
    const [tables, setTables] = useState<TableData[]>([])
    const [newTable, setNewTable] = useState<TableData>({ table_number: '', description: '' })
    const [editingTable, setEditingTable] = useState<TableData | null>(null)



    const fetchTables = useCallback(async () => {
        try {
            const response = await fetch('/api/tables')
            if (response.ok) {
                const data = await response.json()
                setTables(data)
            } else {
                console.error('Failed to fetch tables:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching tables:', error)
        }
    }, [])

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
                body: JSON.stringify(newTable),
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
        <div>
            <h3 className="text-lg font-semibold mb-4">Tables Management</h3>
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Table No"
                    value={newTable.table_number}
                    onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                />
                <Input
                    placeholder="Description"
                    value={newTable.description}
                    onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                />
                <Button onClick={handleCreate}>Add Table</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Table No</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tables.map((table) => table && (
                        <TableRow key={table.table_number}>
                            <TableCell>{table.table_number}</TableCell>
                            <TableCell>
                                {editingTable && editingTable?.table_number === table.table_number ? (
                                    <Input
                                        value={editingTable.description}
                                        onChange={(e) => setEditingTable({ ...editingTable, description: e.target.value })}
                                    />
                                ) : (
                                    table.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editingTable && editingTable?.table_number === table.table_number ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingTable(table)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(table.table_number)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}