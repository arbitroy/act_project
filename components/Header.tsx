'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut } from 'lucide-react'
import type { UseAuthReturn } from '@/hooks/useAuth'
import Image from 'next/image'

interface HeaderProps {
    auth: UseAuthReturn
}

export default function Header({ auth }: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, logout } = auth
    const [pageTitle, setPageTitle] = useState('')

    useEffect(() => {
        const path = pathname?.split('/').filter(Boolean)
        if (path && path.length > 0) {
            setPageTitle(path[path.length - 1].charAt(0).toUpperCase() + path[path.length - 1].slice(1))
        } else {
            setPageTitle('Dashboard')
        }
    }, [pathname])

    const handleLogout = async () => {
        await logout()
        router.push('/login')
    }

    return (
        <header className="bg-green-700 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex space-x-2 items-center">
                        <Image priority src='/act-precast-logo.svg' alt="ACT PRECAST" width={50} height={50} className="rounded-full aspect-square object-cover" />
                        <Link href="/dashboard" className="font-bold text-xl text-white hover:text-green-200 transition-colors">
                            ACT Precast
                        </Link>
                        <span className="ml-4 text-green-200 font-medium">{pageTitle}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-green-500">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.username}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}