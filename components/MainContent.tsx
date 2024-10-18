import React from 'react'

interface MainContentProps {
    children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
    return (
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    )
}