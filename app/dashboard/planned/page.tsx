import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Layout from '@/components/Layout'

export default function PlannedEmployeeDashboard() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
        redirect('/login')
    }

    try {
        const user = jwt.verify(token.value, process.env.JWT_SECRET as string) as { id: number, username: string, role: string }

        if (user.role !== 'planned_employee') {
            redirect('/dashboard')
        }

        return (
            <Layout>
                <div className="bg-white shadow-md rounded-lg p-6 text-zinc-900">
                    <h2 className="text-3xl font-extrabold">Planned Employee Dashboard</h2>
                    <p>Welcome, {user.username}!</p>
                    <ul className="list-disc space-y-2">
                        <li>View assigned projects</li>
                        <li>Submit daily reports</li>
                        <li>Check project schedules</li>
                    </ul>
                </div>
            </Layout>
        )
    } catch (error) {
        console.error(error)
        redirect('/login')
    }
}