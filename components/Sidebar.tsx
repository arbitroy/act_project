'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import type { UseAuthReturn } from '@/hooks/useAuth'

interface SidebarProps {
    auth: UseAuthReturn
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', role: 'all' },
    { name: 'Daily Reports', href: '/daily-reports', role: 'all' },
    { name: 'Master Data', href: '/dashboard/master-data', role: 'manager' },
    { name: 'Planning', href: '/dashboard/planning', role: 'manager' },
    { name: 'Actual Casting', href: '/employee/actual-casting', role: 'actual_employee' }
]

export default function Sidebar({ auth }: SidebarProps) {
    const pathname = usePathname()
    const { user } = auth

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-4 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div className="flex items-center space-x-2 mb-6">
                <Button variant="ghost" className="h-10 w-10 rounded-full">
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                </Button>
                <h2 className="text-2xl font-bold">ACT Precast</h2>
            </div>
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