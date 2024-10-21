import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-green-50 ">
            <Header />
            <div className="flex flex-1 ">
                <Sidebar />
                <MainContent>{children}</MainContent>
            </div>
        </div>
    )
}