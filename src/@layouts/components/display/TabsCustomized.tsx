'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Component Imports
import CustomTabList from '../../../@core/components/mui/TabList'

interface TabData {
  value: string
  label: string
  content: string
}

interface TabsCustomizedProps {
  tabs: TabData[]
}

const TabsCustomized = ({ tabs }: TabsCustomizedProps) => {
  // States
  const [value, setValue] = useState<string>(tabs[0]?.value || '1')

  useEffect(() => {
    if (tabs.length > 0) {
      setValue(tabs[0].value)
    }
  }, [tabs])

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  if (tabs.length === 0) {
    return <Typography>No tabs available</Typography>
  }

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <CustomTabList onChange={handleChange} aria-label='customized tabs example'>
          {tabs.map(tab => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabList>
        {tabs.map(tab => (
          <TabPanel key={tab.value} value={tab.value}>
            <Typography>{tab.content}</Typography>
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  )
}

export default TabsCustomized
