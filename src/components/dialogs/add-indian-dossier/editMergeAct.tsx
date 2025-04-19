'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import FormHelperText from '@mui/material/FormHelperText'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import https from 'https'

// Custom Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define type for prefill data
interface PrefillDataType {
  id: string | number
  title?: string
  description?: string
  url?: string
  status?: string | number
  timestamp?: string
  link?: string
  s?: string | number
  // Add other fields as needed
}

// Define type for form data
interface FormData {
  new_title: string
  discription: string
  status: string
  timestamp: string
  link: string
  s: string
}

// Define props for component
interface EditMergeActProps {
  open: boolean
  setOpen: (open: boolean) => void
  prefillData: PrefillDataType | null
  onSuccess?: () => void
}

// Schema for form validation
const schema = yup.object().shape({
  new_title: yup.string().required('Title is required'),
  discription: yup.string().required('Description is required'),
  status: yup.string().required('Status is required'),
  timestamp: yup.string().required('Date is required'),
  link: yup.string(),
  s: yup.string().required('S value is required')
})

const EditMergeAct = ({ open, setOpen, prefillData, onSuccess }: EditMergeActProps) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Setup form with default values and validation
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      new_title: '',
      discription: '',
      status: '1',
      timestamp: new Date().toISOString(),
      link: '',
      s: '1'
    },
    resolver: yupResolver(schema)
  })

  // Update form values when prefill data changes
  useEffect(() => {
    if (prefillData) {
      // Map prefill data to form fields
      setValue('new_title', prefillData.title || '')
      setValue('discription', prefillData.description || '')
      setValue('status', prefillData.status?.toString() || '1')
      setValue('timestamp', prefillData.timestamp || new Date().toISOString())
      setValue('link', prefillData.link || '')
      setValue('s', prefillData.s?.toString() || '1')
    }
  }, [prefillData, setValue])

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Make sure we have an ID to update
      if (!prefillData?.id) {
        throw new Error('Missing record ID for update')
      }

      // Send update request
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/documentMaster/updateIndianNewsRecord',
        {
          ...data,
          id: prefillData.id
        }
      )

      if (response.data && response.data.success) {
        setSuccess('Update successful!')

        // Call success callback after a delay to show success message
        setTimeout(() => {
          if (onSuccess) onSuccess()
          handleClose()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Failed to update record')
      }
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update Indian news record')
    } finally {
      setLoading(false)
    }
  }

  // Close dialog handler
  const handleClose = () => {
    setOpen(false)
    setError(null)
    setSuccess(null)
    reset()
  }

  // Format date for DatePicker
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString)
    } catch {
      return new Date()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => !loading && handleClose()}
      fullWidth
      maxWidth='md'
      aria-labelledby='edit-merge-act-dialog'
    >
      <DialogTitle id='edit-merge-act-dialog'>
        Edit Indian Update
        <IconButton
          aria-label='close'
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity='error' sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' sx={{ mb: 4 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Title Field */}
            <Grid item xs={12}>
              <Controller
                name='new_title'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='News Title'
                    error={Boolean(errors.new_title)}
                    helperText={errors.new_title?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Description Field */}
            <Grid item xs={12}>
              <Controller
                name='discription'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label='Description'
                    error={Boolean(errors.discription)}
                    helperText={errors.discription?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Status Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <InputLabel id='status-select-label'>Status</InputLabel>
                    <Select {...field} labelId='status-select-label' label='Status' disabled={loading}>
                      <MenuItem value='1'>Active</MenuItem>
                      <MenuItem value='0'>Inactive</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText error>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Date Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name='timestamp'
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label='Date'
                      value={formatDate(field.value)}
                      onChange={date => {
                        if (date) {
                          field.onChange(date.toISOString())
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(errors.timestamp),
                          helperText: errors.timestamp?.message,
                          disabled: loading
                        }
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>

            {/* Link Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name='link'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Link'
                    error={Boolean(errors.link)}
                    helperText={errors.link?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* S Field */}
            <Grid item xs={12} md={6}>
              <Controller
                name='s'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.s)}>
                    <InputLabel id='s-select-label'>S Value</InputLabel>
                    <Select {...field} labelId='s-select-label' label='S Value' disabled={loading}>
                      <MenuItem value='1'>1</MenuItem>
                      <MenuItem value='0'>0</MenuItem>
                    </Select>
                    {errors.s && <FormHelperText error>{errors.s.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={loading}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color='inherit' />}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditMergeAct
