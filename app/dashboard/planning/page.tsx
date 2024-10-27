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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Element {
    id: number
    element_id: string
    volume: string
}

interface PlannedCasting {
    id: number
    element_id: number
    planned_volume: number
    planned_amount: number
    planned_date: string
}

interface PlanningForm {
    element_id: string
    planned_volume: number
    planned_amount: number
    planned_date: string
}

interface RemainingQuantity {
    elementId: number
    totalVolume: number
    totalCasted: number
    remainingVolume: number
    completionPercentageVolume: number
    totalPlannedAmount: number  // Add this
    totalCastedAmount: number  // Add this
    remainingAmount: number    // Add this
    completionPercentageAmount: number  // Add this
}

export default function Planning(): JSX.Element {
    const [elements, setElements] = useState<Element[]>([])
    const [plannedCastings, setPlannedCastings] = useState<PlannedCasting[]>([])
    const [selectedElement, setSelectedElement] = useState<Element | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [remainingQuantity, setRemainingQuantity] = useState<RemainingQuantity | null>(null)

    const { control, handleSubmit, reset, formState: { errors } } = useForm<PlanningForm>({
        defaultValues: {
            element_id: '',
            planned_volume: 0,
            planned_amount: 0,
            planned_date: ''
        }
    })


    useEffect(() => {
        void fetchElements()
        void fetchPlannedCastings()
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

    const fetchPlannedCastings = async (): Promise<void> => {
        try {
            const response = await fetch('/api/planned-castings')
            if (!response.ok) {
                throw new Error('Failed to fetch planned castings')
            }
            const data: PlannedCasting[] = await response.json()
            setPlannedCastings(data)
        } catch (error) {
            console.error('Error fetching planned castings:', error)
            toast({
                title: "Error",
                description: "Failed to fetch planned castings",
                variant: "destructive",
            })
        }
    }

    const fetchRemainingQuantity = async (elementId: string) => {
        try {
            const response = await fetch(`/api/elements/${elementId}/remaining`)
            if (!response.ok) {
                throw new Error('Failed to fetch remaining quantity')
            }
            const data: RemainingQuantity = await response.json()
            setRemainingQuantity(data)
        } catch (error) {
            console.error('Error fetching remaining quantity:', error)
            toast({
                title: "Error",
                description: "Failed to fetch remaining quantity",
                variant: "destructive",
            })
        }
    }

    const handleElementSelect = (elementId: string) => {
        const element = elements.find(e => e.id === parseInt(elementId, 10))
        setSelectedElement(element || null)
        if (element) {
            fetchRemainingQuantity(elementId)
        } else {
            setRemainingQuantity(null)
        }
    }

    const onSubmit = async (data: PlanningForm): Promise<void> => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/planned-castings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to create planned casting')
            }

            toast({
                title: "Success",
                description: "Planned casting created successfully",
            })
            reset()
            setSelectedElement(null)
            void fetchPlannedCastings()
        } catch (error) {
            console.error('Error creating planned casting:', error)
            toast({
                title: "Error",
                description: "Failed to create planned casting",
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
                            Create planned castings for construction elements
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

                                {selectedElement && remainingQuantity && (
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md mb-4">
                                        <div>
                                            <Label className="text-black">Total Volume</Label>
                                            <p className="text-black font-medium">{remainingQuantity.totalVolume} m³</p>
                                        </div>
                                        <div>
                                            <Label className="text-black">Remaining Volume</Label>
                                            <p className="text-black font-medium">{remainingQuantity.remainingVolume} m³</p>
                                        </div>
                                        <div>
                                            <Label className="text-black">Volume Completion</Label>
                                            <p className="text-black font-medium">{remainingQuantity.completionPercentageVolume}%</p>
                                        </div>
                                        <div>
                                            <Label className="text-black">Total Amount</Label>
                                            <p className="text-black font-medium">{remainingQuantity.totalPlannedAmount}</p>
                                        </div>
                                        <div>
                                            <Label className="text-black">Remaining Amount</Label>
                                            <p className="text-black font-medium">{remainingQuantity.remainingAmount}</p>
                                        </div>
                                        <div>
                                            <Label className="text-black">Amount Completion</Label>
                                            <p className="text-black font-medium">{remainingQuantity.completionPercentageAmount}%</p>
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
                                        <Label htmlFor="planned_amount" className="text-black">
                                            Planned Amount
                                        </Label>
                                        <Controller
                                            name="planned_amount"
                                            control={control}
                                            rules={{
                                                required: "Planned amount is required",
                                                min: { value: 0, message: "Amount must be positive" }
                                            }}
                                            render={({ field: { onChange, value } }) => (
                                                <div className="space-y-1">
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        value={value}
                                                        onChange={(e) => onChange(parseInt(e.target.value))}
                                                        className="border-green-200 focus:ring-green-500 focus:border-green-500
                                                                 text-black placeholder-gray-400"
                                                    />
                                                    {errors.planned_amount && (
                                                        <p className="text-sm text-red-500">{errors.planned_amount.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="planned_date" className="text-black">
                                        Planned Casting Date
                                    </Label>
                                    <Controller
                                        name="planned_date"
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
                                                {errors.planned_date && (
                                                    <p className="text-sm text-red-500">{errors.planned_date.message}</p>
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
                                    Creating...
                                </>
                            ) : (
                                'Create Plan'
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="max-w-2xl mx-auto mt-8 bg-white shadow-lg border-green-100">
                <CardHeader className="border-b border-green-100">
                        <CardTitle className="text-2xl text-black">Planned Castings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Element ID</TableHead>
                                    <TableHead>Planned Volume (m³)</TableHead>
                                    <TableHead>Planned Amount</TableHead>
                                    <TableHead>Planned Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plannedCastings.map((casting) => (
                                    <TableRow key={casting.id}>
                                        <TableCell>{elements.find(e => e.id === casting.element_id)?.element_id}</TableCell>
                                        <TableCell>{casting.planned_volume}</TableCell>
                                        <TableCell>{casting.planned_amount}</TableCell>
                                        <TableCell>{new Date(casting.planned_date).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}