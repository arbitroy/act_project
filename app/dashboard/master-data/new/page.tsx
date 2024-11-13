'use client'
import { ProjectForm } from '../_components/ProjectForm'
import Layout from '@/components/Layout'
export default function NewProject() {
    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-black">New Project</h2>
                <ProjectForm />
            </div>
        </Layout>
    )
}
