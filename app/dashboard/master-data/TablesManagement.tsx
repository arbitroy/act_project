'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TableData {
    tableno: string;  // Changed from tableNo to tableno
    description: string;
}

export default function TablesManagement() {
    const [tables, setTables] = useState<TableData[]>([])
    const [newTable, setNewTable] = useState<TableData>({ tableno: '', description: '' })
    const [editingTable, setEditingTable] = useState<TableData | null>(null)
    const token = localStorage.getItem('token');

    const fetchTables = useCallback(async () => {
        try {
            const response = await fetch('/api/tables', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log('Fetched tables:', data) // Add this line for debugging
                setTables(data)
            } else {
                console.error('Failed to fetch tables:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching tables:', error)
        }
    }, [token])

    useEffect(() => {
        fetchTables()
    }, [fetchTables])

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newTable),
            })
            if (response.ok) {
                setNewTable({ tableno: '', description: '' })
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
                    'Authorization': `Bearer ${token}`
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

    const handleDelete = async (tableno: string) => {
        try {
            const response = await fetch('/api/tables', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tableno }),
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
                    value={newTable.tableno}
                    onChange={(e) => setNewTable({ ...newTable, tableno: e.target.value })}
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
                        <TableRow key={table.tableno}>
                            <TableCell>{table.tableno}</TableCell>
                            <TableCell>
                                {editingTable?.tableno === table.tableno ? (
                                    <Input
                                        value={editingTable.description}
                                        onChange={(e) => setEditingTable({ ...editingTable, description: e.target.value })}
                                    />
                                ) : (
                                    table.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editingTable?.tableno === table.tableno ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingTable(table)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(table.tableno)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}