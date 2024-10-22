import Layout from '@/components/Layout'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function EmployeeDashboard() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
        redirect('/login')
    }

    try {
        const user = jwt.verify(token.value, process.env.JWT_SECRET as string) as { id: number, username: string, role: string }

        if (user.role !== 'actual_employee') {
            redirect('/dashboard')
        }

        return (
            <Layout>
                <div className="bg-white shadow-md rounded-lg p-6 text-zinc-900">
                    <h2 className="text-3xl font-extrabold">Actual Employee Dashboard</h2>
                    <p>Welcome, {user.username}!</p>
                    <ul className="list-disc space-y-2">
                        <li>Update actual production numbers</li>
                        <li>View daily targets</li>
                        <li>Report issues or delays</li>
                    </ul>
                </div>
            </Layout>

        )
    } catch (error) {
        console.error(error)
        redirect('/login')
    }
}