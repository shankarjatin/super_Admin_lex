'use client'

// Component Imports
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import https from 'https'
import { CircularProgress, Alert, Card, CardHeader, Button, Snackbar } from '@mui/material'
import StatesMasterTable from '@/views/apps/states-master/statesMasterTable'
import AddEditState from '@/components/dialogs/add-states'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for state data
interface StateData {
  id?: string
  stateName: string
  stateShortName: string
  status: string | number | boolean
  isDeleted?: string
}

// Define API response interface
interface ApiResponse {
  success: boolean
  statusCode: number
  message: string
  data: StateData[]
}

// Define prefill response interface
interface PrefillResponse {
  success: boolean
  data: {
    id?: string
    name: string
    short_name: string
    status: string | number | boolean
  }
}

// Snackbar notification type
interface SnackbarNotification {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
}

const StatesMaster = () => {
  // States
  const [states, setStates] = useState<StateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [selectedState, setSelectedState] = useState<StateData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarNotification>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Show snackbar notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Fetch states on component mount
  useEffect(() => {
    fetchStates()
  }, [])

  // Function to fetch states
  const fetchStates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get<ApiResponse>(
        'https://ai.lexcomply.co/v2/api/stateMaster/getStateMasterList',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('API Response:', response.data)

      // Properly handle the API response structure
      if (response.data && response.data.success) {
        // Even if data is empty, it's a valid response
        setStates(response.data.data || [])
      } else {
        // Just log the error but don't set the error state
        console.error('API returned unsuccessful response')
        setStates([])
      }
    } catch (error) {
      console.error('Error fetching states:', error)
      // Don't set error state, just use empty array
      setStates([])
    } finally {
      setLoading(false)
    }
  }

  // Handle state creation/update
  const handleStateSubmit = async (stateData: StateData) => {
    try {
      setIsSubmitting(true)

      const isEdit = !!stateData.id

      // Create the payload for API
      const payload = {
        edit: isEdit ? '1' : '0', // Set edit flag based on whether we're editing or creating
        name: stateData.stateName,
        short_name: stateData.stateShortName,
        status: stateData.status === true ? '1' : '0' // Convert to string format
      }

      // If editing, include the ID
      if (isEdit) {
        payload['id'] = stateData.id
      }

      console.log('Submitting state data:', payload)

      // Use a single endpoint for both create and update
      const endpoint = 'https://ai.lexcomply.co/v2/api/stateMaster/createStateMaster'

      const response = await axiosInstance.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log(`State ${isEdit ? 'updated' : 'created'}:`, response.data)

      // Show success notification
      showNotification(`State successfully ${isEdit ? 'updated' : 'created'}`, 'success')

      // Refresh states list after successful operation
      fetchStates()

      // Close dialog and reset selected state
      setOpenAddDialog(false)
      setSelectedState(null)
    } catch (error) {
      console.error(`Error ${stateData.id ? 'updating' : 'creating'} state:`, error)

      // Show error notification
      showNotification(`Failed to ${stateData.id ? 'update' : 'create'} state. Please try again.`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle state edit with prefill data from API
  const handleEditState = async (id: string) => {
    try {
      setIsSubmitting(true)

      // Fetch pre-filled data for the state
      const response = await axiosInstance.get<PrefillResponse>(
        `https://ai.lexcomply.co/v2/api/stateMaster/statePrefill?id=${id}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Prefill response:', response.data)

      if (response.data && response.data.success) {
        const prefillData = response.data.data
        console.log('Prefill data:', prefillData)
        // Map the API response to the format expected by the dialog
        const formattedState = {
          id: id,
          stateName: prefillData.name || '',
          stateShortName: prefillData.short_name || '',
          status: prefillData.status === 1 || prefillData.status === '1' || prefillData.status === true
        }
        console.log('Formatted state data:', formattedState)
        setSelectedState(formattedState)
        setOpenAddDialog(true)
      } else {
        showNotification('Failed to load state details', 'error')
      }
    } catch (error) {
      console.error('Error fetching state details:', error)
      showNotification('Failed to load state details', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle state deletion
  const handleDeleteState = async (id: string) => {
    try {
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/stateMaster/removeState',
        { id },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('State deleted:', response.data)

      // Show success notification
      showNotification('State successfully deleted', 'success')

      // Refresh states list after successful deletion
      fetchStates()
    } catch (error) {
      console.error('Error deleting state:', error)

      // Show error notification
      showNotification('Failed to delete state. Please try again.', 'error')
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title='State Master'
          action={
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => {
                setSelectedState(null)
                setOpenAddDialog(true)
              }}
            >
              Add State
            </Button>
          }
        />
      </Card>

      <div className='mt-6'>
        {/* Show error message if there's an error */}
        {error && (
          <Alert severity='error' sx={{ width: '100%', mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Show loading indicator */}
        {loading && (
          <div className='flex justify-center py-4'>
            <CircularProgress />
          </div>
        )}

        {/* Always show the table when not loading, regardless of data */}
        {!loading && (
          <Card>
            <StatesMasterTable
              data={states}
              onEdit={handleEditState}
              onDelete={handleDeleteState}
              onRefresh={fetchStates}
            />
          </Card>
        )}
      </div>

      {/* Add/Edit State dialog */}
      <AddEditState
        open={openAddDialog}
        setOpen={setOpenAddDialog}
        data={selectedState}
        isLoading={isSubmitting}
        onSubmit={handleStateSubmit}
      />

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default StatesMaster
