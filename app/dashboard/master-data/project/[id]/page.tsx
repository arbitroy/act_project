'use client'

import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import MasterDataTabs from '../../MasterDataTabs'
import { useEffect, useState } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from 'next/link'

interface Project {
    id: number;
    project_number: string;
    name: string;
    description: string;
}

export default function ProjectPage() {
    const params = useParams()
    const projectId = params.id
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}`)
                if (!response.ok) {
                    throw new Error('Project not found')
                }
                const data = await response.json()
                setProject(data)
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to load project')
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
    }, [projectId])

    if (loading) {
        return (
            <Layout>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-4 w-full max-w-md mb-8" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </Layout>
        )
    }

    if (error || !project) {
        return (
            <Layout>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Project</h2>
                        <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
                        <Link href="/dashboard/master-data">
                            <Button>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-6">
                    <Link href="/dashboard/master-data" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Projects
                    </Link>
                </div>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                    <p className="text-sm text-gray-500">Project #{project.project_number}</p>
                    {project.description && (
                        <p className="mt-2 text-gray-600">{project.description}</p>
                    )}
                </div>

                <MasterDataTabs projectId={projectId} />
            </div>
        </Layout>
    )
}