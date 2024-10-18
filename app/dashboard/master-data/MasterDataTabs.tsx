'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JobsManagement from './JobsManagement'
import TablesManagement from './TablesManagement'
import ElementsManagement from './ElementsManagement'

export default function MasterDataTabs() {
    const [activeTab, setActiveTab] = useState('jobs')

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="elements">Elements</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs">
                <JobsManagement />
            </TabsContent>
            <TabsContent value="tables">
                <TablesManagement />
            </TabsContent>
            <TabsContent value="elements">
                <ElementsManagement />
            </TabsContent>
        </Tabs>
    )
}