'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import type { UseAuthReturn } from '@/hooks/useAuth'
import Image from 'next/image'

interface SidebarProps {
    auth: UseAuthReturn
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', role: 'all' },
    { name: 'Daily Reports', href: '/daily-reports', role: 'all' },
    { name: 'Master Data', href: '/dashboard/master-data', role: 'manager' },
    { name: 'Actual Casting', href: '/employee/actual-casting', role: 'actual_employee' }
]

export default function Sidebar({ auth }: SidebarProps) {
    const pathname = usePathname()
    const { user } = auth

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-4 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div className="flex items-center space-x-2 mb-6">
                <Button variant="ghost">
                    <Image priority src='/act-precast-logo.svg' alt="ACT PRECAST" width={50} height={50} className="rounded-full aspect-square object-cover"/>
                </Button>
                <h2 className="text-2xl font-bold">ACT Precast</h2>
            </div>
            <nav>
                {navigation.map((item) => (
                    (item.role === 'all' || user?.role === item.role) && (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block py-2.5 px-4 rounded transition duration-200 ${pathname === item.href
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