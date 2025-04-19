'use client'
import { useState } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

// Component Imports
import IndianUpdateTable from './IndianUpdateTable'
import GetNewsTable from './GetNewsTable'
import IndianUpdateDetail from './IndianUpdateDetail'
// import InternationalUpdateTable from './InternationalUpdateTable'
// import DailyDossierTable from './DailyDossierTable'
// import MailSendToAllTable from './MailSendToAllTable'

const NewsFeedMain = () => {
  // States
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label='simple tabs example'>
        <Tab value='1' label='Get News' />
        <Tab value='2' label='Indain Update' />
        <Tab value='3' label='Daily Dossier' />
        <Tab value='4' label='Mail Send To All' />
      </TabList>

      <TabPanel value='1'>
        <GetNewsTable />
      </TabPanel>
      <TabPanel value='2'>
        <IndianUpdateDetail />
      </TabPanel>
      {/* 
      <TabPanel value='2'>
        <InternationalUpdateTable />
      </TabPanel>

      <TabPanel value='3'>
        <DailyDossierTable />
      </TabPanel>

      <TabPanel value='4'>
        <MailSendToAllTable />
      </TabPanel> */}
    </TabContext>
  )
}

export default NewsFeedMain
