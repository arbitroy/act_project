'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export function ProjectForm() {
    const router = useRouter()
    const [project, setProject] = useState({
        project_number: '',
        name: '',
        description: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            })

            if (response.ok) {
                const data = await response.json()
                router.push(`/master-data/project/${data.id}`)
            }
        } catch (error) {
            console.error('Error creating project:', error)
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="project_number">Project Number</Label>
                        <Input
                            id="project_number"
                            value={project.project_number}
                            onChange={e => setProject({...project, project_number: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={project.name}
                            onChange={e => setProject({...project, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={project.description}
                            onChange={e => setProject({...project, description: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create Project</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}