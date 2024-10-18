'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', role: 'all' },
    { name: 'Daily Reports', href: '/daily-reports', role: 'all' },
    { name: 'Master Data', href: '/dashboard/master-data', role: 'Manager' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <nav>
                {navigation.map((item) => (
                    (item.role === 'all' || user?.role === item.role) && (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block py-2.5 px-4 rounded transition duration-200 ${
                                pathname === item.href
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {item.name}
                        </Link>
                    )
                ))}
            </nav>
        </div>
    )
}