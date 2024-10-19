'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const TabsContext = React.createContext<{
    activeTab: string
    setActiveTab: (value: string) => void
} | undefined>(undefined)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue || '')

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTab(value)
        }
    }, [value])

    const handleTabChange = React.useCallback((newValue: string) => {
        setActiveTab(newValue)
        onValueChange?.(newValue)
    }, [onValueChange])

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={cn('space-y-2', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>

export function TabsList({ className, ...props }: TabsListProps) {
    return (
        <div
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
                className
            )}
            {...props}
        />
    )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

export function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error('TabsTrigger must be used within a Tabs component')
    }

    const { activeTab, setActiveTab } = context

    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                activeTab === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                className
            )}
            onClick={() => setActiveTab(value)}
            {...props}
        />
    )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error('TabsContent must be used within a Tabs component')
    }

    const { activeTab } = context

    if (activeTab !== value) {
        return null
    }

    return <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...props} />
}