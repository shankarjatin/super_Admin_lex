'use client'

// Component Imports
import React, { useEffect, useState } from 'react'
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import axios from 'axios'
import https from 'https'
import { CircularProgress, Alert } from '@mui/material'
import InternationalActTable from '@/views/apps/act-master/InternationalActTable'
import FormMasterTable from '@/views/apps/form-master/FormMasterTable'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for the dropdown API response
interface InternationalActOption {
  id: number
  actId: number
  name: string
  type?: string
}

// Define the type for the act details API response
interface InternationalActDetails {
  id: string
  act_id: string
  category: string
  continent: string
  country: string
  state: string
  city: string
  region: string
  isDeleted: string
  actId: number
  actName: string
  actDescription: string
}

// Define the type for table data (make sure it matches what the table component expects)
interface ActTableData {
  id: string
  name?: string
  productName?: string
  description?: string
  country?: string
  state?: string
  city?: string
  category?: string
  continent?: string
  region?: string
  type?: string
  subject?: string
  scope?: string
  status?: string
  price?: number
  complianceCount?: number
  sku?: string // Required by ProductType
  stock?: boolean // Required by ProductType
  qty?: number // Required by ProductType
}

const FormMaster = () => {
  const [options, setOptions] = useState<InternationalActOption[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedAct, setSelectedAct] = useState<InternationalActOption | null>(null)
  const [actDetails, setActDetails] = useState<ActTableData[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch dropdown options from the API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/getInternationalActDrop', {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = response.data // API response data
        console.log('Dropdown options loaded:', data.length, 'items')
        setOptions(data) // Update state with fetched data
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        setOptions([]) // Set empty array in case of error
        setError('Failed to load acts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [])

  // Function to fetch act details when an act is selected
  const fetchActDetails = async (actId: number) => {
    try {
      setDetailsLoading(true)
      setError(null)

      console.log(`Fetching details for act ID: ${actId}`)

      // Use our custom axios instance to handle SSL issues
      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/actMaster/getInternationalAct?id=${actId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Raw API response:', response)
      console.log('Act details response data:', response.data)

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Map the API response to the format expected by the table component
        const formattedData = response.data.map((act: InternationalActDetails) => {
          console.log('Processing act:', act)
          return {
            id: act.id || act.act_id || String(act.actId) || '',
            name: act.actName || '',
            productName: act.actName || '',
            description: act.actDescription || '',
            country: act.country || 'Global',
            state: act.state || '',
            city: act.city || '',
            category: act.category || '',
            continent: act.continent || '',
            region: act.region || '',
            type: act.category === 'State' ? 'state' : 'central', // Default type based on category
            subject: '', // Not available in the response
            scope: act.state ? 'State' : 'National',
            status: 'Active', // Default status
            complianceCount: 0, // Not available in the response
            sku: 'SKU-' + act.id, // Required by ProductType
            stock: true, // Required by ProductType
            qty: 1 // Required by ProductType
          }
        })

        console.log('Formatted act details:', formattedData)
        setActDetails(formattedData) // Set the formatted act details in state
      } else {
        console.error('Invalid or empty response format for act details', response.data)
        setActDetails([]) // Clear act details in case of invalid data
        setError('No details found for the selected act.')
      }
    } catch (error) {
      console.error('Error fetching act details:', error)
      setActDetails([]) // Clear act details in case of error
      setError('Failed to load act details. Please try again later.')
    } finally {
      setDetailsLoading(false)
    }
  }

  // Handle act selection from dropdown
  const handleActChange = (event: any, newValue: InternationalActOption | null) => {
    console.log('Selected value:', newValue)

    if (newValue && newValue.id) {
      console.log(`Selected Act ID: ${newValue.id}, Name: ${newValue.name}`)

      // Ensure that fetchActDetails is invoked and log it
      console.log('Fetching act details now...')
      fetchActDetails(newValue.id)
    } else {
      console.log('No act selected, clearing act details...')
      // Clear the details if no act is selected
      setActDetails([])
    }
    setSelectedAct(newValue)
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Show error message if there's an error */}
      {error && (
        <Alert severity='error' sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      {/* Autocomplete dropdown */}
      <div className='w-full'>
        <CustomAutocomplete
          fullWidth
          options={options}
          value={selectedAct}
          loading={loading}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue)
          }}
          onChange={handleActChange}
          id='autocomplete-international-acts'
          getOptionLabel={option => option.name || ''}
          isOptionEqualToValue={(option, value) => option.actId === value.actId}
          renderInput={params => (
            <CustomTextField
              {...params}
              label='Search International Acts'
              placeholder='Start typing to search acts'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </div>

      {/* Show loading indicator while fetching details */}
      {detailsLoading && (
        <div className='flex justify-center py-4'>
          <CircularProgress />
        </div>
      )}

      {/* Pass the fetched data to the table component */}
      {!detailsLoading && actDetails.length > 0 && (
        <>
          {/* <div className='mb-2'>
            <Alert severity='success'>Act details loaded successfully.</Alert>
          </div> */}
          <FormMasterTable />
        </>
      )}

      {/* Show a message when no act is selected yet */}
      {!detailsLoading && actDetails.length === 0 && !error && (
        <div className='text-center py-8 text-textSecondary'>
          Please select an act from the dropdown to view details.
        </div>
      )}
    </div>
  )
}

export default FormMaster
