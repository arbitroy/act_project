'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
    const router = useRouter()

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' })
        if (res.ok) {
            router.push('/login')
        }
    }

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="font-bold text-xl text-gray-800">
                            ACT PRECAST
                        </Link>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}