'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Element {
    elementId: string
    volume: number
    weight: number
}

export default function ElementsManagement() {
    const [elements, setElements] = useState<Element[]>([])
    const [newElement, setNewElement] = useState<Element>({ elementId: '', volume: 0, weight: 0 })
    const [editingElement, setEditingElement] = useState<Element | null>(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchElements()
    }, [])

    const fetchElements = async () => {
        const response = await fetch('/api/elements')
        if (response.ok) {
            const data = await response.json()
            setElements(data)
        }
    }

    const handleCreate = async () => {
        const response = await fetch('/api/elements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newElement),
        })
        if (response.ok) {
            setNewElement({ elementId: '', volume: 0, weight: 0 })
            fetchElements()
        }
    }

    const handleUpdate = async () => {
        if (!editingElement) return
        const response = await fetch('/api/elements', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editingElement),
        })
        if (response.ok) {
            setEditingElement(null)
            fetchElements()
        }
    }

    const handleDelete = async (elementId: string) => {
        const response = await fetch('/api/elements', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ elementId }),
        })
        if (response.ok) {
            fetchElements()
        }
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Elements Management</h3>
            <div className="flex gap-4 mb-4">
                <Input
                    placeholder="Element ID"
                    value={newElement.elementId}
                    onChange={(e) => setNewElement({ ...newElement, elementId: e.target.value })}
                />
                <Input
                    type="number"
                    placeholder="Volume"
                    value={newElement.volume}
                    onChange={(e) => setNewElement({ ...newElement, volume: parseFloat(e.target.value) })}
                />
                <Input
                    type="number"
                    placeholder="Weight"
                    value={newElement.weight}
                    onChange={(e) => setNewElement({ ...newElement, weight: parseFloat(e.target.value) })}
                />
                <Button onClick={handleCreate}>Add Element</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Element ID</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {elements.map((element) => (
                        <TableRow key={element.elementId}>
                            <TableCell>{element.elementId}</TableCell>
                            <TableCell>
                                {editingElement?.elementId === element.elementId ? (
                                    <Input
                                        type="number"
                                        value={editingElement.volume}
                                        onChange={(e) => setEditingElement({ ...editingElement, volume: parseFloat(e.target.value) })}
                                    />
                                ) : (
                                    element.volume
                                )}
                            </TableCell>
                            <TableCell>
                                {editingElement?.elementId === element.elementId ? (
                                    <Input
                                        type="number"
                                        value={editingElement.weight}
                                        onChange={(e) => setEditingElement({ ...editingElement, weight: parseFloat(e.target.value) })}
                                    />
                                ) : (
                                    element.weight
                                )}
                            </TableCell>
                            <TableCell>
                                {editingElement?.elementId === element.elementId ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingElement(element)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(element.elementId)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}