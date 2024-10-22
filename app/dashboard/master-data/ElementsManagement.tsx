'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


interface Element {
    element_id: string;  // Changed from element_id to element_id
    volume: string;     // Changed from number to string
    weight: string;     // Changed from number to string
}

export default function ElementsManagement() {
    const [elements, setElements] = useState<Element[]>([])
    const [newElement, setNewElement] = useState<Element>({ element_id: '', volume: '0', weight: '0' })
    const [editingElement, setEditingElement] = useState<Element | null>(null)


    const fetchElements = useCallback(async () => {
        try {
            const response = await fetch('/api/elements', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (response.ok) {
                const data = await response.json()
                setElements(data)
            } else {
                console.error('Failed to fetch elements:', response.statusText)
            }
        } catch (error) {
            console.error('Error fetching elements:', error)
        }
    }, [])

    useEffect(() => {
        fetchElements()
    }, [fetchElements])



    const handleCreate = async () => {
        const response = await fetch('/api/elements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newElement),
        })
        if (response.ok) {
            setNewElement({ element_id: '', volume: '0', weight: '0' })
            fetchElements()
        }
    }

    const handleUpdate = async () => {
        if (!editingElement) return
        const response = await fetch('/api/elements', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editingElement),
        })
        if (response.ok) {
            setEditingElement(null)
            fetchElements()
        }
    }

    const handleDelete = async (element_id: string) => {
        const response = await fetch('/api/elements', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ element_id }),
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
                    type="number"
                    placeholder="Element ID"
                    value={newElement.element_id}
                    onChange={(e) => setNewElement({ ...newElement, element_id: e.target.value })}
                />
                <Input
                    type="number"
                    placeholder="Volume"
                    value={newElement.volume}
                    onChange={(e) => setNewElement({ ...newElement, volume: e.target.value })}
                />
                <Input
                    type="number"
                    placeholder="Weight"
                    value={newElement.weight}
                    onChange={(e) => setNewElement({ ...newElement, weight: e.target.value })}
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
                        <TableRow key={element.element_id}>
                            <TableCell>{element.element_id}</TableCell>
                            <TableCell>
                                {editingElement && editingElement?.element_id === element.element_id ? (
                                    <Input
                                        type="number"
                                        value={editingElement.volume}
                                        onChange={(e) => setEditingElement({ ...editingElement, volume: e.target.value })}
                                    />
                                ) : (
                                    parseFloat(element.volume).toFixed(2)
                                )}
                            </TableCell>
                            <TableCell>
                                {editingElement && editingElement?.element_id === element.element_id ? (
                                    <Input
                                        type="number"
                                        value={editingElement.weight}
                                        onChange={(e) => setEditingElement({ ...editingElement, weight: e.target.value })}
                                    />
                                ) : (
                                    parseFloat(element.weight).toFixed(2)
                                )}
                            </TableCell>
                            <TableCell>
                                {editingElement && editingElement?.element_id === element.element_id ? (
                                    <Button onClick={handleUpdate}>Save</Button>
                                ) : (
                                    <Button onClick={() => setEditingElement(element)}>Edit</Button>
                                )}
                                <Button variant="destructive" onClick={() => handleDelete(element.element_id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}