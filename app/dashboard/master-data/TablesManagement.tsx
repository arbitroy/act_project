'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Table {
    tableNo: string
    description: string
}

export default function TablesManagement() {
    const [tables, setTables] = useState<Table[]>([])
    const [newTable, setNewTable] = useState<Table>({ tableNo: '', description: '' })
    const [editingTable, setEditingTable] = useState<Table | null>(null)
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchTables()
    }, [])

    const fetchTables = async () => {
        const response = await fetch('/api/tables')
        if (response.ok) {
            const data = await response.json()
            setTables(data)
        }
    }

    const handleCreate = async () => {
        const response = await fetch('/api/tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newTable),
        })
        if (response.ok) {
            setNewTable({ tableNo: '', description: '' })
            fetchTables()
        }
    }

    const handleUpdate = async () => {
        if (!editingTable) return
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
        }
    }

    const handleDelete = async (tableNo: string) => {
        const response = await fetch('/api/tables', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tableNo }),
        })
        if (response.ok) {
            fetchTables()
        }
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Tables Management</h3>
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Table No"
                    value={newTable.tableNo}
                    onChange={(e) => setNewTable({ ...newTable, tableNo: e.target.value })}
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
                    {tables.map((table) => (
                        <TableRow key={table.tableNo}>
                            <TableCell>{table.tableNo}</TableCell>
                            <TableCell>
                                {editingTable?.tableNo === table.tableNo ? (
                                    <Input
                                        value={editingTable.description}
                                        onChange={(e) => setEditingTable({ ...editingTable, description: e.target.value })}
                                    />
                                ) : (
                                    table.description
                                )}
                            </TableCell>
                            <TableCell>
                                {editingTable?.tableNo === table.tableNo ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingTable(table)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(table.tableNo)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}