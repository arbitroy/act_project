'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JobsManagement from './JobsManagement'
import TablesManagement from './TablesManagement'
import ElementsManagement from './ElementsManagement'
interface MasterDataTabsProps {
    projectId: string | string[]
}

export default function MasterDataTabs({ projectId }: MasterDataTabsProps) {
    const [activeTab, setActiveTab] = useState('jobs')

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="elements">Elements</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs">
                <JobsManagement projectId={projectId} />
            </TabsContent>
            <TabsContent value="tables">
                <TablesManagement projectId={projectId} />
            </TabsContent>
            <TabsContent value="elements">
                <ElementsManagement projectId={projectId} />
            </TabsContent>
        </Tabs>
    )
}