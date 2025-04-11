'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

// Axios Import
import axios from 'axios'
import https from 'https'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from '@core/components/mui/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Create axios instance
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Type Import
type AddEditStateData = {
  id?: string
  stateName: string
  stateShortName: string
  active?: boolean
  status?: string | number | boolean
}

type AddEditStateProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: AddEditStateData | null
  isLoading?: boolean
  onSubmit?: (data: any) => Promise<void>
}

// Define Snackbar notification type
type SnackbarNotification = {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
}

const initialStateData: AddEditStateData = {
  stateName: '',
  stateShortName: '',
  active: false
}

const AddEditState = ({ open, setOpen, data, isLoading = false, onSubmit }: AddEditStateProps) => {
  // States
  console.log('AddEditState data:', data)
  const [stateData, setStateData] = useState<AddEditStateData>(initialStateData)
  const [loading, setLoading] = useState(false)

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarNotification>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Update stateData when the dialog opens or when data is provided
  useEffect(() => {
    if (data) {
      // Normalize the data format to ensure consistency
      setStateData({
        id: data.id,
        stateName: data.stateName || '',
        stateShortName: data.stateShortName || '',
        active:
          data.active !== undefined ? data.active : data.status === true || data.status === 1 || data.status === '1'
      })
    } else {
      // Reset to initial state when adding new
      setStateData(initialStateData)
    }
  }, [open, data])

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!stateData.stateName || !stateData.stateShortName) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)

      // If onSubmit prop is provided, use it
      if (onSubmit) {
        await onSubmit({
          id: stateData.id,
          stateName: stateData.stateName,
          stateShortName: stateData.stateShortName,
          status: stateData.active // Use active as status
        })
        return // Let the parent component handle success/errors
      }

      // Otherwise handle submission internally
      // Prepare the data to be sent to the API
      const apiRequestData = {
        edit: stateData.id ? '1' : '0',
        name: stateData.stateName,
        short_name: stateData.stateShortName || '',
        status: stateData.active ? '1' : '0'
      }

      // Add ID if editing
      if (stateData.id) {
        apiRequestData['id'] = stateData.id
      }

      console.log('Sending data to API:', apiRequestData)

      // Make the API call
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/stateMaster/createStateMaster',
        apiRequestData
      )

      console.log('API Response:', response.data)

      // Check if the response indicates success
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to save state')
      }

      // If we get here, the request was successful
      setSnackbar({
        open: true,
        message: stateData.id ? 'State updated successfully' : 'State created successfully',
        severity: 'success'
      })

      // Close the dialog after a short delay
      setTimeout(() => {
        setOpen(false)
      }, 1000)
    } catch (error) {
      console.error('Error:', error)

      // Show error message
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save state',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        maxWidth='md'
        scroll='body'
        onClose={() => !loading && !isLoading && setOpen(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          {stateData.id ? 'Edit State' : 'Add New State'}
          <Typography component='span' className='flex flex-col text-center'>
            {stateData.id ? 'Edit the state information' : 'Add state details'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Grid container spacing={6}>
              {/* State Name */}
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='State Name'
                  name='stateName'
                  required
                  placeholder='Enter State Name'
                  value={stateData.stateName}
                  onChange={e => setStateData({ ...stateData, stateName: e.target.value })}
                  disabled={loading || isLoading}
                />
              </Grid>

              {/* State Short Name */}
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='State Short Name'
                  name='stateShortName'
                  required
                  placeholder='Enter State Short Name'
                  value={stateData.stateShortName}
                  onChange={e => setStateData({ ...stateData, stateShortName: e.target.value })}
                  disabled={loading || isLoading}
                />
              </Grid>

              {/* Active Switch */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={stateData.active || false}
                      onChange={e => setStateData({ ...stateData, active: e.target.checked })}
                      name='active'
                      disabled={loading || isLoading}
                    />
                  }
                  label='Active'
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='contained' type='submit' disabled={loading || isLoading}>
              {loading || isLoading ? <CircularProgress size={24} /> : stateData.id ? 'Update' : 'Submit'}
            </Button>
            <Button
              variant='tonal'
              color='secondary'
              onClick={() => !loading && !isLoading && setOpen(false)}
              type='reset'
              disabled={loading || isLoading}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Local Snackbar for notifications */}
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

export default AddEditState
