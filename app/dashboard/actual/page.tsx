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
                <div className="bg-white shadow-lg rounded-xl p-8 border border-green-100">
                    <div className="border-b border-green-100 pb-6 mb-6">
                        <h2 className="text-3xl font-extrabold text-green-800">Actual Employee Dashboard</h2>
                        <p className="text-lg mt-2 text-green-600">Welcome, <span className="font-semibold">{user.username}</span>!</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-green-800 mb-4">Quick Actions</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 hover:text-green-800 cursor-pointer transition-colors">
                                    Update actual production numbers
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 hover:text-green-800 cursor-pointer transition-colors">
                                    View daily targets
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 hover:text-green-800 cursor-pointer transition-colors">
                                    Report issues or delays
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Layout>
        )
    } catch (error) {
        console.error(error)
        redirect('/login')
    }
}