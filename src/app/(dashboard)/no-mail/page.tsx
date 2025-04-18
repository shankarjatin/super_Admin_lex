import ComplianceMasterTable from '@/views/apps/compliance-master/ComplianceMasterTable'
import { Card, CardHeader } from '@mui/material'

// Server Component - No 'use client' directive
const ComplianceMaster = () => {
  return (
    <Card>
      <CardHeader title='No Mail' />
      <ComplianceMasterTable />
    </Card>
  )
}

export default ComplianceMaster
