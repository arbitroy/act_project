'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from 'next/link'

interface Project {
    id: number
    project_number: string
    name: string
    description: string
}

export default function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([])
    const router = useRouter()

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects')
            if (response.ok) {
                const data = await response.json()
                setProjects(data.projects || [])
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => router.push('/dashboard/master-data/new')}  // Updated path
                    className="bg-green-600 hover:bg-green-700"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                    <Link 
                        key={project.id} 
                        href={`/dashboard/master-data/project/${project.id}`}  // Updated path
                    >
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">#{project.project_number}</p>
                                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}