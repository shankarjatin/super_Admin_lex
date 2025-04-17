import ComplianceEventTable from '@/views/apps/compliance-event/ComplianceEventTable'
import ComplianceMasterTable from '@/views/apps/compliance-master/ComplianceMasterTable'
import EventInfoDetails from '@/views/apps/event-info/EventInfoDetails'
import { Card, CardHeader } from '@mui/material'

// Server Component - No 'use client' directive
const ComplianceMaster = () => {
  return (
    <Card>
      <CardHeader title='Compliance Event' />
      <EventInfoDetails />
    </Card>
  )
}

export default ComplianceMaster
