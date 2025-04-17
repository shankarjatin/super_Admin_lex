'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'

// Create axios instance
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Types
type EventCategory = {
  id: string | number
  name: string
}

type EventData = {
  id?: string
  eventName: string
  categoryId: string | number
  categoryName?: string
  eventDate?: string
  startTime?: string
  endTime?: string
}

type AddEventDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: EventData | null
  onSuccess?: () => void
}

// Define Snackbar notification type
type SnackbarNotification = {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
}

const initialEventData: EventData = {
  eventName: '',
  categoryId: ''
}

const AddEventDialog = ({ open, setOpen, data, onSuccess }: AddEventDialogProps) => {
  // States
  const [eventData, setEventData] = useState<EventData>(initialEventData)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [errors, setErrors] = useState<{
    eventName?: string
    categoryId?: string
  }>({})

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarNotification>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories()
  }, [])

  // Update eventData when the dialog opens or when data is provided
  useEffect(() => {
    if (data) {
      // Normalize the data format to ensure consistency
      setEventData({
        id: data.id,
        eventName: data.eventName || '',
        categoryId: data.categoryId || '',
        eventDate: data.eventDate || '',
        startTime: data.startTime || '',
        endTime: data.endTime || ''
      })
    } else {
      // Reset to initial state when adding new
      setEventData(initialEventData)
    }
    // Clear any previous errors
    setErrors({})
  }, [open, data])

  // Fetch event categories from API
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)

      // In a real application, you would fetch from your API
      // const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/events/categories')
      // setCategories(response.data)

      // For this example, using static categories
      setCategories([
        { id: 1, name: 'Amendment' },
        { id: 2, name: 'Implementation' },
        { id: 3, name: 'Update' },
        { id: 4, name: 'Reform' },
        { id: 5, name: 'Regulatory Change' }
      ])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load event categories',
        severity: 'error'
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors: {
      eventName?: string
      categoryId?: string
    } = {}

    if (!eventData.eventName.trim()) {
      newErrors.eventName = 'Event name is required'
    }

    if (!eventData.categoryId) {
      newErrors.categoryId = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Prepare the data to be sent to the API
      const apiRequestData = {
        id: eventData.id || null,
        eventName: eventData.eventName,
        categoryId: eventData.categoryId,
        // Include additional fields if needed
        eventDate: eventData.eventDate || new Date().toISOString().split('T')[0],
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '17:00'
      }

      console.log('Sending event data to API:', apiRequestData)

      // In a real application, you would make the API call
      // const response = await axiosInstance.post(
      //   `https://ai.lexcomply.co/v2/api/events/${eventData.id ? 'update' : 'create'}`,
      //   apiRequestData
      // )

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Show success message
      setSnackbar({
        open: true,
        message: eventData.id ? 'Event updated successfully' : 'Event created successfully',
        severity: 'success'
      })

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Close the dialog after a short delay
      setTimeout(() => {
        setOpen(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving event:', error)

      // Show error message
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save event',
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
        onClose={() => !loading && setOpen(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          {eventData.id ? 'Edit Event' : 'Add New Event'}
          <Typography component='span' className='flex flex-col text-center'>
            {eventData.id ? 'Update the event information' : 'Create a new event'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <Grid container spacing={6}>
              {/* Event Name */}
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Event Name'
                  name='eventName'
                  required
                  placeholder='Enter Event Name'
                  value={eventData.eventName}
                  onChange={e => setEventData({ ...eventData, eventName: e.target.value })}
                  disabled={loading}
                  error={!!errors.eventName}
                  helperText={errors.eventName}
                />
              </Grid>

              {/* Category Dropdown */}
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.categoryId}>
                  <InputLabel id='event-category-label'>Category</InputLabel>
                  <Select
                    labelId='event-category-label'
                    id='event-category'
                    value={eventData.categoryId}
                    label='Category'
                    onChange={e => setEventData({ ...eventData, categoryId: e.target.value })}
                    disabled={loading || loadingCategories}
                  >
                    {loadingCategories ? (
                      <MenuItem disabled>Loading categories...</MenuItem>
                    ) : (
                      categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : eventData.id ? 'Update' : 'Submit'}
            </Button>
            <Button
              variant='tonal'
              color='secondary'
              onClick={() => !loading && setOpen(false)}
              type='reset'
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default AddEventDialog
