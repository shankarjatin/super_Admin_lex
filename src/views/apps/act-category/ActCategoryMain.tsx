'use client'
// React Imports
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'

// Component Imports
import ComplianceMasterTable from '@/views/apps/compliance-master/ComplianceMasterTable'
import ExportArchiveTable from '@/views/apps/compliance-master/ExportArchive'
import ViewActsTable from './ViewActsTable'

// Define props type for TabsBasic
type TabsBasicProps = {
  actDetails?: any // Update this type according to your actual data structure
}

const TabsBasic = ({ actDetails }: TabsBasicProps) => {
  // States
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label='compliance tabs'>
        <Tab value='1' label='View for acts' />
        <Tab value='2' label='View for dossier' />
      </TabList>
      <TabPanel value='1'>
        <ViewActsTable />
      </TabPanel>
      <TabPanel value='2'>
        <ExportArchiveTable />
      </TabPanel>
      {/* <TabPanel value='3'>
        <Typography>
          Danish tiramisu jujubes cupcake chocolate bar cake cheesecake chupa chups. Macaroon ice cream tootsie roll
          carrot cake gummi bears.
        </Typography>
      </TabPanel> */}
    </TabContext>
  )
}

export default TabsBasic
