'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Element {
    element_id: string;
    volume: string;
    weight: string;
}

const WEIGHT_MULTIPLIER = 2.5;

export default function ElementsManagement() {
    const [elements, setElements] = useState<Element[]>([])
    const [newElement, setNewElement] = useState<Element>({ element_id: '', volume: '0', weight: '0' })
    const [editingElement, setEditingElement] = useState<Element | null>(null)

    // Calculate weight based on volume
    const calculateWeight = (volume: string): string => {
        const numericVolume = parseFloat(volume);
        return (numericVolume * WEIGHT_MULTIPLIER).toFixed(2);
    };

    // Modified setNewElement to include weight calculation
    const handleVolumeChange = (volume: string) => {
        const calculatedWeight = calculateWeight(volume);
        setNewElement({ 
            ...newElement, 
            volume: volume,
            weight: calculatedWeight
        });
    };

    // Modified setEditingElement to include weight calculation
    const handleEditVolumeChange = (volume: string) => {
        if (editingElement) {
            const calculatedWeight = calculateWeight(volume);
            setEditingElement({
                ...editingElement,
                volume: volume,
                weight: calculatedWeight
            });
        }
    };

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
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Elements Management</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Creation Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="element-id" className="text-sm font-medium text-gray-700">
                            Element ID
                        </Label>
                        <Input
                            id="element-id"
                            type="text"
                            placeholder="Enter Element ID"
                            value={newElement.element_id}
                            onChange={(e) => setNewElement({ ...newElement, element_id: e.target.value })}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Unique identifier for the element
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="volume" className="text-sm font-medium text-gray-700">
                            Volume (m³)
                        </Label>
                        <Input
                            id="volume"
                            type="number"
                            placeholder="Enter volume"
                            value={newElement.volume}
                            onChange={(e) => handleVolumeChange(e.target.value)}
                            className="w-full"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500">
                            Volume in cubic meters
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                            Weight (T)
                        </Label>
                        <Input
                            id="weight"
                            type="number"
                            value={newElement.weight}
                            disabled
                            className="w-full bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">
                            Calculated: Volume × 2.5 (tonnes)
                        </p>
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                        <Button 
                            onClick={handleCreate} 
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Add Element
                        </Button>
                    </div>
                </div>

                {/* Elements Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Element ID</TableHead>
                                <TableHead className="font-semibold">Volume (m³)</TableHead>
                                <TableHead className="font-semibold">Weight (T)</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {elements.map((element) => (
                                <TableRow key={element.element_id}>
                                    <TableCell>{element.element_id}</TableCell>
                                    <TableCell>
                                        {editingElement && editingElement?.element_id === element.element_id ? (
                                            <div className="space-y-1">
                                                <Label htmlFor={`edit-volume-${element.element_id}`} className="sr-only">
                                                    Volume (m³)
                                                </Label>
                                                <Input
                                                    id={`edit-volume-${element.element_id}`}
                                                    type="number"
                                                    value={editingElement.volume}
                                                    onChange={(e) => handleEditVolumeChange(e.target.value)}
                                                    step="0.01"
                                                />
                                            </div>
                                        ) : (
                                            parseFloat(element.volume).toFixed(2)
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingElement && editingElement?.element_id === element.element_id ? (
                                            <div className="space-y-1">
                                                <Label htmlFor={`edit-weight-${element.element_id}`} className="sr-only">
                                                    Weight (T)
                                                </Label>
                                                <Input
                                                    id={`edit-weight-${element.element_id}`}
                                                    type="number"
                                                    value={editingElement.weight}
                                                    disabled
                                                    className="bg-gray-100"
                                                />
                                            </div>
                                        ) : (
                                            parseFloat(element.weight).toFixed(2)
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {editingElement && editingElement?.element_id === element.element_id ? (
                                                <Button 
                                                    onClick={handleUpdate} 
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button 
                                                    onClick={() => setEditingElement(element)} 
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            <Button 
                                                className="bg-red-600 hover:bg-red-700" 
                                                onClick={() => handleDelete(element.element_id)}
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