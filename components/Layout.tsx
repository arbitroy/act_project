'use client'
import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import { ToastProvider } from './ui/toast'
import { Toaster } from './ui/toaster'
import { useAuth } from '@/hooks/useAuth'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const auth = useAuth()

    if (auth.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-green-50">
            <ToastProvider>
                <Header auth={auth} />
                <div className="flex flex-1">
                    <Sidebar auth={auth} />
                    <MainContent>{children}</MainContent>
                    <Toaster />
                </div>
            </ToastProvider>
        </div>
    )
}