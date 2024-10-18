import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import LogoutButton from '../LogoutButton'

export default function PlannedEmployeeDashboard() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
        redirect('/login')
    }

    try {
        const user = jwt.verify(token.value, process.env.JWT_SECRET as string) as { id: number, username: string, role: string }

        if (user.role !== 'PlannedEmployee') {
            redirect('/dashboard')
        }

        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <h2 className="text-3xl font-extrabold text-gray-900">Planned Employee Dashboard</h2>
                                    <p>Welcome, {user.username}!</p>
                                    <ul className="list-disc space-y-2">
                                        <li>View assigned projects</li>
                                        <li>Submit daily reports</li>
                                        <li>Check project schedules</li>
                                    </ul>
                                </div>
                                <div className="pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error(error)
        redirect('/login')
    }
}