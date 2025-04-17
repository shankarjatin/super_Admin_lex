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
import AllEvents from '@/views/apps/events/AllEvents'
import ActEvents from '@/views/apps/events/ActEvents'
import AffectedActs from '@/views/apps/events/AffectedActs'
const TabsBasic = () => {
  // States
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label='simple tabs example'>
        <Tab value='1' label='All Events' />
        <Tab value='2' label='Act Events' />
        <Tab value='3' label='Affected Events' />
      </TabList>
      <TabPanel value='1'>
        <AllEvents />
      </TabPanel>
      <TabPanel value='2'>
        <ActEvents />
      </TabPanel>
      <TabPanel value='3'>
        <AffectedActs />
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
