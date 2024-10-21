import React from 'react'

interface MainContentProps {
    children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
    return (
        <main className="flex-1 overflow-y-auto p-6 bg-green-50">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    )
}