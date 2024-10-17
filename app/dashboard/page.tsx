import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default function Dashboard() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    let user = null
    if (token) {
        try {
            user = jwt.verify(token.value, process.env.JWT_SECRET as string) as { username: string, role: string }
        } catch (error) {
            console.error('Invalid token:', error)
            redirect('/login')
        }
    } else {
        redirect('/login')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome, {user.username}!</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Your role is: {user.role}</p>
                </div>
                <div className="mt-8 space-y-6">
                    <LogoutButton />
                </div>
            </div>
        </div>
    )
}