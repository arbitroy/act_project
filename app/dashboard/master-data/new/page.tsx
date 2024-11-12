'use client'
import { ProjectForm } from '../_components/ProjectForm'

export default function NewProject() {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">New Project</h2>
            <ProjectForm />
        </div>
    )
}
