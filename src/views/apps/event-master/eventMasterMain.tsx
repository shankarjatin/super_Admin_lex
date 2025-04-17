// React Imports
'use client'
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import FutureComplianceTable from '@/views/apps/compliance-master/FutureComplianceTable'
import ExportArchiveTable from '@/views/apps/compliance-master/ExportArchive'
import ShowAllEvent from './ShowAllEvent'
import ShowActEvent from './ShowActEvent'
import ShowAffectedEvent from './ShowAffectedEvent'
const TabsBasic = () => {
  // States
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label='simple tabs example'>
        <Tab value='1' label='Show Act Event' />
        <Tab value='2' label='Show All Event ' />
        <Tab value='3' label='Act Event' />
        <Tab value='4' label='Show All Events with Affected Acts' />
      </TabList>
      <TabPanel value='1'>
        <ShowActEvent />
      </TabPanel>
      <TabPanel value='2'>
        <ShowAllEvent />
      </TabPanel>
      <TabPanel value='4'>
        <ShowAffectedEvent />
      </TabPanel>
    </TabContext>
  )
}

export default TabsBasic
