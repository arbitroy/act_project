import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import { ToastProvider } from './ui/toast'
import { Toaster } from './ui/toaster'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-green-50 ">
            <ToastProvider>
                <Header />
                <div className="flex flex-1 ">
                    <Sidebar />
                    <MainContent>{children}</MainContent>
                    <Toaster />
                </div>
            </ToastProvider>
        </div>
    )
}