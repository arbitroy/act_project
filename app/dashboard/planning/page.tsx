'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import Layout from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Element {
    id: number  // Changed from string to number
    element_id: string
    volume: string  // Changed from number to string to match API
    weight: string  // Changed from number to string to match API
    planned_volume: number | null
    planned_weight: number | null
    planned_casting_date: string | null
}

interface PlanningForm {
    element_id: string
    planned_volume: number
    planned_weight: number
    planned_casting_date: string
}

export default function Planning(): JSX.Element {
    const [elements, setElements] = useState<Element[]>([])
    const [selectedElement, setSelectedElement] = useState<Element | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const { control, handleSubmit, reset, formState: { errors } } = useForm<PlanningForm>({
        defaultValues: {
            element_id: '',
            planned_volume: 0,
            planned_weight: 0,
            planned_casting_date: ''
        }
    })

    useEffect(() => {
        void fetchElements()
    }, [])

    const fetchElements = async (): Promise<void> => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/elements')
            if (!response.ok) {
                throw new Error('Failed to fetch elements')
            }
            const data: Element[] = await response.json()
            setElements(data)
        } catch (error) {
            console.error('Error fetching elements:', error)
            toast({
                title: "Error",
                description: "Failed to fetch elements",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleElementSelect = (elementId: string) => {
        const element = elements.find(e => e.id === parseInt(elementId, 10))
        setSelectedElement(element || null)
    }

    const onSubmit = async (data: PlanningForm): Promise<void> => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/elements/${data.element_id}/plan`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to update element plan')
            }

            toast({
                title: "Success",
                description: "Element plan updated successfully",
            })
            reset()
            setSelectedElement(null)
        } catch (error) {
            console.error('Error updating element plan:', error)
            toast({
                title: "Error",
                description: "Failed to update element plan",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        reset()
        setSelectedElement(null)
    }

    return (
        <Layout>
            <div className="container mx-auto py-8 px-4 bg-green-50">
                <Card className="max-w-2xl mx-auto bg-white shadow-lg border-green-100">
                    <CardHeader className="border-b border-green-100">
                        <CardTitle className="text-2xl text-black">Element Planning</CardTitle>
                        <CardDescription className="text-black">
                            Update planning details for construction elements
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="element_id" className="text-black">Element</Label>
                                    <Controller
                                        name="element_id"
                                        control={control}
                                        rules={{ required: "Please select an element" }}
                                        render={({ field }) => (
                                            <div className="space-y-1">
                                                <select
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        handleElementSelect(e.target.value)
                                                    }}
                                                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-green-200 
                                                             bg-white text-black focus:outline-none focus:ring-2 
                                                             focus:ring-green-500 focus:border-green-500"
                                                >
                                                    <option value="">Select an element</option>
                                                    {elements.map((element) => (
                                                        <option key={element.id} value={element.id}>
                                                            {element.element_id}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.element_id && (
                                                    <p className="text-sm text-red-500">{errors.element_id.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                {selectedElement && (
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md mb-4">
                                        <div>
                                            <Label className="text-black">Current Volume</Label>
                                            <p className="text-black font-medium">{selectedElement.volume} m³</p>
                                        </div>
                                        <div>
                                            <Label className="text-black">Current Weight</Label>
                                            <p className="text-black font-medium">{selectedElement.weight} kg</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="planned_volume" className="text-black">
                                            Planned Volume (m³)
                                        </Label>
                                        <Controller
                                            name="planned_volume"
                                            control={control}
                                            rules={{ 
                                                required: "Planned volume is required",
                                                min: { value: 0, message: "Volume must be positive" }
                                            }}
                                            render={({ field: { onChange, value } }) => (
                                                <div className="space-y-1">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={value}
                                                        onChange={(e) => onChange(parseFloat(e.target.value))}
                                                        className="border-green-200 focus:ring-green-500 focus:border-green-500
                                                                 text-black placeholder-gray-400"
                                                    />
                                                    {errors.planned_volume && (
                                                        <p className="text-sm text-red-500">{errors.planned_volume.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="planned_weight" className="text-black">
                                            Planned Weight (kg)
                                        </Label>
                                        <Controller
                                            name="planned_weight"
                                            control={control}
                                            rules={{ 
                                                required: "Planned weight is required",
                                                min: { value: 0, message: "Weight must be positive" }
                                            }}
                                            render={({ field: { onChange, value } }) => (
                                                <div className="space-y-1">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={value}
                                                        onChange={(e) => onChange(parseFloat(e.target.value))}
                                                        className="border-green-200 focus:ring-green-500 focus:border-green-500
                                                                 text-black placeholder-gray-400"
                                                    />
                                                    {errors.planned_weight && (
                                                        <p className="text-sm text-red-500">{errors.planned_weight.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="planned_casting_date" className="text-black">
                                        Planned Casting Date
                                    </Label>
                                    <Controller
                                        name="planned_casting_date"
                                        control={control}
                                        rules={{ required: "Please select a casting date" }}
                                        render={({ field }) => (
                                            <div className="space-y-1">
                                                <Input 
                                                    type="date"
                                                    {...field}
                                                    className="border-green-200 focus:ring-green-500 focus:border-green-500
                                                             text-black"
                                                />
                                                {errors.planned_casting_date && (
                                                    <p className="text-sm text-red-500">{errors.planned_casting_date.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-4 border-t border-green-100 mt-6">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="border-green-200 text-black hover:bg-green-50"
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Plan'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    )
}