import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Layout from '@/components/Layout'

export default function ManagerDashboard() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
        redirect('/login')
    }

    try {
        const user = jwt.verify(token.value, process.env.JWT_SECRET as string) as { id: number, username: string, role: string }

        if (user.role !== 'Manager') {
            redirect('/dashboard')
        }

        return (
            <Layout>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Manager Dashboard</h2>
                    <p className="mb-4">Welcome, {user.username}!</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>View all project reports</li>
                        <li>Manage employee assignments</li>
                        <li>Generate performance analytics</li>
                    </ul>
                </div>
            </Layout>
        )
    } catch (error) {
        console.error(error)
        redirect('/login')
    }
}