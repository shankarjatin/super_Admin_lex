'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'

// Axios Import for API calls
import axios from 'axios'
import https from 'https'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define interface for dashboard data
interface DashboardData {
  act2: number
  act: number
  company: number
  company2: number
  compliance: number
  event: number
  event2: number
  document: number
  form: number
  news: number
  subscribe: number
}

// Dashboard component
const Dashboard = () => {
  // State
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get<DashboardData>('https://ai.lexcomply.co/v2/api/dashboard')

        if (response.data) {
          console.log('Dashboard data:', response.data)
          setDashboardData(response.data)
        } else {
          throw new Error('No data received')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Define dashboard cards with their respective icons and colors
  const dashboardCards = [
    {
      title: 'Acts',
      icon: 'tabler-gavel',
      color: 'primary',
      value: dashboardData ? `${dashboardData.act} + ${dashboardData.act2 - dashboardData.act}` : 0,
      subtitle: 'Total Acts'
    },
    {
      title: 'Compliance',
      icon: 'tabler-checklist',
      color: 'success',
      value: dashboardData?.compliance || 0,
      subtitle: 'Compliance Items'
    },

    {
      title: 'Events',
      icon: 'tabler-calendar-event',
      color: 'info',
      value: dashboardData ? dashboardData.event2 : 0,
      subtitle: 'Scheduled Events'
    },
    {
      title: 'Companies',
      icon: 'tabler-building-skyscraper',
      color: 'warning',
      value: dashboardData ? `${dashboardData.company} + ${dashboardData.company2}` : 0,
      subtitle: 'Registered Companies'
    },
    {
      title: 'Documents',
      icon: 'tabler-file-text',
      color: 'error',
      value: dashboardData?.document || 0,
      subtitle: 'Uploaded Documents'
    },
    {
      title: 'Forms',
      icon: 'tabler-clipboard-text',
      color: 'secondary',
      value: dashboardData?.form || 0,
      subtitle: 'Available Forms'
    },
    {
      title: 'News',
      icon: 'tabler-news',
      color: 'info',
      value: dashboardData?.news || 0,
      subtitle: 'News Articles'
    },
    {
      title: 'Subscriptions',
      icon: 'tabler-bell-ringing',
      color: 'warning',
      value: dashboardData?.subscribe || 0,
      subtitle: 'Active Subscriptions'
    }
  ]

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show error state
  if (error) {
    return (
      <Alert severity='error' sx={{ width: '100%', mb: 4 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      {dashboardCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card>
            <CardContent sx={{ padding: theme => `${theme.spacing(6)} !important` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Avatar
                  sx={{
                    boxShadow: 0,
                    bgcolor: theme => `${theme.palette[card.color].light}`,
                    color: theme => `${theme.palette[card.color].main}`
                  }}
                >
                  <i className={card.icon} />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
                  <Typography variant='h4' sx={{ fontWeight: 600 }}>
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {card.title}
                  </Typography>
                </Box>
              </Box>
              <Typography variant='subtitle2' sx={{ color: 'text.secondary', mt: 3 }}>
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default Dashboard
