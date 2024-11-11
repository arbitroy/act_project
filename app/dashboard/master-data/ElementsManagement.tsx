'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface Element {
    element_id: string;
    volume: string;
    weight: string;
    status: 'active' | 'inactive';
}

interface ApiError {
    error: string;
    message: string;
}

const isApiError = (error: unknown): error is ApiError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        'message' in error
    )
}

const WEIGHT_MULTIPLIER = 2.5;

export default function ElementsManagement() {
    const [elements, setElements] = useState<Element[]>([])
    const [newElement, setNewElement] = useState<Omit<Element, 'status'>>({ 
        element_id: '', 
        volume: '0', 
        weight: '0' 
    })
    const [editingElement, setEditingElement] = useState<Element | null>(null)
    const [showInactive, setShowInactive] = useState(false)
    const [elementToDelete, setElementToDelete] = useState<string | null>(null)

    // Calculate weight based on volume
    const calculateWeight = (volume: string): string => {
        const numericVolume = parseFloat(volume || '0');
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
            const response = await fetch(`/api/elements${showInactive ? '?includeInactive=true' : ''}`)
            if (!response.ok) {
                const error: ApiError = await response.json()
                throw new Error(error.message || 'Failed to fetch elements')
            }
            const data = await response.json()
            setElements(data)
        } catch (error) {
            const message = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while fetching elements'
            
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            })
        }
    }, [showInactive])

    useEffect(() => {
        fetchElements()
    }, [fetchElements])


    const handleCreate = async () => {
        try {
            const response = await fetch('/api/elements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newElement),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(isApiError(data) ? data.message : 'Failed to create element')
            }

            setNewElement({ element_id: '', volume: '0', weight: '0' })
            await fetchElements()
            toast({
                title: "Success",
                description: "Element created successfully.",
            })
        } catch (error) {
            const message = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while creating the element'
            
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            })
        }
    }

    const handleUpdate = async () => {
        if (!editingElement) return
        
        try {
            const response = await fetch('/api/elements', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    element_id: editingElement.element_id,
                    volume: editingElement.volume,
                    weight: editingElement.weight
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(isApiError(data) ? data.message : 'Failed to update element')
            }

            setEditingElement(null)
            await fetchElements()
            toast({
                title: "Success",
                description: "Element updated successfully.",
            })
        } catch (error) {
            const message = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while updating the element'
            
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            })
        }
    }

    const handleDelete = async () => {
        if (!elementToDelete) return
        
        try {
            const response = await fetch('/api/elements', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ element_id: elementToDelete }),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(isApiError(data) ? data.message : 'Failed to deactivate element')
            }

            await fetchElements()
            toast({
                title: "Success",
                description: "Element deactivated successfully.",
            })
        } catch (error) {
            const message = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while deactivating the element'
            
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            })
        } finally {
            setElementToDelete(null)
        }
    }

    const handleRestore = async (elementId: string) => {
        try {
            const response = await fetch('/api/elements', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ element_id: elementId }),
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(isApiError(data) ? data.message : 'Failed to restore element')
            }

            await fetchElements()
            toast({
                title: "Success",
                description: "Element restored successfully.",
            })
        } catch (error) {
            const message = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while restoring the element'
            
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            })
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Elements Management</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={showInactive}
                            onCheckedChange={setShowInactive}
                            id="show-inactive"
                        />
                        <Label htmlFor="show-inactive">Show Inactive Elements</Label>
                    </div>
                </div>
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
                            Calculated: Volume × 2.5 (kgs)
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
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {elements.map((element) => (
                                <TableRow 
                                    key={element.element_id}
                                    className={element.status === 'inactive' ? 'bg-gray-50' : ''}
                                >
                                    <TableCell>{element.element_id}</TableCell>
                                    <TableCell>
                                        {editingElement?.element_id === element.element_id ? (
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
                                        {editingElement?.element_id === element.element_id ? (
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
                                        <span className={element.status === 'inactive' ? 'text-gray-500' : ''}>
                                            {element.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {element.status === 'active' ? (
                                                <>
                                                    {editingElement?.element_id === element.element_id ? (
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
                                                        onClick={() => setElementToDelete(element.element_id)}
                                                    >
                                                        Deactivate
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleRestore(element.element_id)}
                                                >
                                                    Restore
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Deactivation Confirmation Dialog */}
                <AlertDialog open={!!elementToDelete} onOpenChange={(open) => !open && setElementToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deactivation</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to deactivate this element? The element will be marked as inactive but can be restored later.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                                Deactivate
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}