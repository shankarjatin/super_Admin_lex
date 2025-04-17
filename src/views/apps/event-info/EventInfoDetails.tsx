'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import CustomTextField from '@core/components/mui/TextField'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for the dropdown API response
interface EventOption {
  id: number
  event: string
  isDeleted: string
}

// Define the type for company event list response
// This will be updated once we know the structure of the API response
interface CompanyEventData {
  [key: string]: any
}

const EventInfoDetails = () => {
  // States for dropdown
  const [options, setOptions] = useState<EventOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<EventOption | null>(null)

  // States for company event data
  const [companyEventData, setCompanyEventData] = useState<CompanyEventData | null>(null)
  const [loadingCompanyEvents, setLoadingCompanyEvents] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dropdown options from the API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        setError(null)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/eventMaster/getEventInfoDrop', {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.data && response.data.data) {
          console.log('Event dropdown options loaded:', response.data.data.length, 'items')
          setOptions(response.data.data)
        } else {
          setOptions([])
          setError('No dropdown data received from server')
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        setOptions([])
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Function to fetch company event data when an event is selected
  const fetchCompanyEventData = async (eventName: string) => {
    try {
      setLoadingCompanyEvents(true)
      setError(null)

      console.log(`Fetching company events for event: ${eventName}`)

      // Note: This is a GET request but we need to pass the event name in the body
      // Some APIs may not support GET with body, so we might need to use POST if this fails
      const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/eventMaster/getCompanyEventList', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: { event: eventName } // This is the body for the GET request
      })

      if (response.data) {
        console.log('Company event data loaded:', response.data)
        setCompanyEventData(response.data)
      } else {
        console.log('No company event data found or invalid format')
        setCompanyEventData(null)
      }
    } catch (error) {
      console.error('Error fetching company event data:', error)
      setError('Failed to load company event data. Please try again later.')
      setCompanyEventData(null)
    } finally {
      setLoadingCompanyEvents(false)
    }
  }

  // Alternative approach using POST if GET with body doesn't work
  const fetchCompanyEventDataPost = async (eventName: string) => {
    try {
      setLoadingCompanyEvents(true)
      setError(null)

      console.log(`Fetching company events for event: ${eventName}`)

      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/eventMaster/getCompanyEventList',
        { event: eventName },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        console.log('Company event data loaded:', response.data)
        setCompanyEventData(response.data)
      } else {
        console.log('No company event data found or invalid format')
        setCompanyEventData(null)
      }
    } catch (error) {
      console.error('Error fetching company event data:', error)
      setError('Failed to load company event data. Please try again later.')
      setCompanyEventData(null)
    } finally {
      setLoadingCompanyEvents(false)
    }
  }

  // Handle event selection from dropdown
  const handleEventChange = (event: any, newValue: EventOption | null) => {
    setSelectedEvent(newValue)
    if (newValue && newValue.event) {
      // Try the GET approach first
      fetchCompanyEventData(newValue.event)

      // If you encounter issues with GET having a body, uncomment the line below
      // and comment out the fetchCompanyEventData call above
      // fetchCompanyEventDataPost(newValue.event)
    } else {
      setCompanyEventData(null)
    }
  }

  // Handle manual fetch button click (as an alternative)
  const handleManualFetch = () => {
    if (selectedEvent && selectedEvent.event) {
      fetchCompanyEventData(selectedEvent.event)
    }
  }

  return (
    <Card>
      <CardHeader
        title='Event Information'
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': { fontSize: '1.25rem' }
        }}
      />

      {/* Autocomplete dropdown for events */}
      <div className='w-full px-6 py-4'>
        <CustomAutocomplete
          fullWidth
          options={options}
          value={selectedEvent}
          loading={loadingOptions}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue)
          }}
          onChange={handleEventChange}
          id='autocomplete-events'
          getOptionLabel={option => option.event || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => (
            <CustomTextField
              {...params}
              label='Search Events'
              placeholder='Start typing to search events'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingOptions ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </div>

      <Divider />

      {/* Additional Button to manually fetch data if needed */}
      <div className='flex justify-end items-center px-6 py-3'>
        <Button variant='contained' onClick={handleManualFetch} disabled={!selectedEvent || loadingCompanyEvents}>
          {loadingCompanyEvents ? (
            <>
              <CircularProgress size={24} color='inherit' />
              &nbsp;Loading...
            </>
          ) : (
            'Fetch Company Events'
          )}
        </Button>
      </div>

      <Divider />

      {/* Show error message if there's an error */}
      {error && (
        <Alert severity='error' sx={{ mx: 6, my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Show loading indicator while fetching data */}
      {loadingCompanyEvents && (
        <div className='flex justify-center py-8'>
          <CircularProgress size={40} />
        </div>
      )}

      {/* Show message when no event is selected */}
      {!loadingCompanyEvents && !selectedEvent && !error && (
        <div className='text-center py-8 text-textSecondary'>
          Please select an event from the dropdown to view company event data.
        </div>
      )}

      {/* Show message when company event data is fetched */}
      {!loadingCompanyEvents && companyEventData && !error && (
        <div className='text-center py-8'>
          <Alert severity='success' sx={{ mx: 6, my: 2 }}>
            Company event data has been successfully fetched and stored.
          </Alert>
          <Typography variant='caption' color='textSecondary' className='mt-2'>
            Selected Event: {selectedEvent?.event}
          </Typography>
        </div>
      )}
    </Card>
  )
}

export default EventInfoDetails
