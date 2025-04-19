'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Create axios instance for API calls with SSL verification disabled
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define interfaces for API responses
interface UrlOption {
  url: string
}

// Props interface
interface MergeActNameProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

const MergeActName = ({ open, setOpen, onSuccess }: MergeActNameProps) => {
  // States
  const [urlOptions, setUrlOptions] = useState<UrlOption[]>([])
  const [selectedUrl, setSelectedUrl] = useState<UrlOption | null>(null)
  const [actName, setActName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingUrls, setLoadingUrls] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Fetch URLs for dropdown when component mounts or dialog opens
  useEffect(() => {
    if (open) {
      fetchUrlOptions()
    }
  }, [open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedUrl(null)
      setActName('')
      setInputValue('')
    }
  }, [open])

  // Fetch URL options
  const fetchUrlOptions = async () => {
    try {
      setLoadingUrls(true)
      const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/getRssDepartmentDrop')

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUrlOptions(response.data.data)
      } else {
        throw new Error('Invalid URL data format')
      }
    } catch (error) {
      console.error('Error fetching URL options:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load URLs. Please try again.',
        severity: 'error'
      })
    } finally {
      setLoadingUrls(false)
    }
  }

  // Handle URL selection
  const handleUrlChange = (event: any, newValue: UrlOption | null) => {
    setSelectedUrl(newValue)
  }

  // Handle input change for dropdown
  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue)
  }

  // Handle close dialog
  const handleClose = () => {
    if (!loading) {
      setOpen(false)
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return selectedUrl !== null && actName.trim() !== ''
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!selectedUrl) {
        setSnackbar({
          open: true,
          message: 'Please select a URL',
          severity: 'error'
        })
        return
      }

      if (!actName.trim()) {
        setSnackbar({
          open: true,
          message: 'Please enter an Act name',
          severity: 'error'
        })
        return
      }

      setLoading(true)

      // Prepare data for submission
      const submitData = {
        url: selectedUrl.url,
        actName: actName.trim()
      }

      // Submit data
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/documentMaster/mergeActName',
        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Act name merged successfully',
          severity: 'success'
        })

        // Close dialog after successful submission
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Merge failed')
      }
    } catch (error) {
      console.error('Error merging act name:', error)
      setSnackbar({
        open: true,
        message: `Failed to merge: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth aria-labelledby='merge-act-name-dialog'>
        <DialogTitle id='merge-act-name-dialog'>
          Merge Act Name
          <DialogCloseButton onClick={handleClose} disabled={loading} />
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 10
                }}
              >
                <CircularProgress />
              </Box>
            )}

            <Typography variant='body1' sx={{ mb: 3 }}>
              Associate an act name with a URL
            </Typography>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={urlOptions}
                  loading={loadingUrls}
                  value={selectedUrl}
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  onChange={handleUrlChange}
                  id='url-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Select URL'
                      placeholder='Choose a URL to associate'
                      error={!selectedUrl && snackbar.severity === 'error'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingUrls ? <CircularProgress color='inherit' size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  getOptionLabel={option => option.url || ''}
                  isOptionEqualToValue={(option, value) => option.url === value.url}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Act Name'
                  required
                  placeholder='Enter the act name to associate'
                  value={actName}
                  onChange={e => setActName(e.target.value)}
                  disabled={loading}
                  error={actName.trim() === '' && snackbar.severity === 'error'}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button variant='contained' onClick={handleSubmit} disabled={loading || !isFormValid()}>
            {loading ? <CircularProgress size={24} /> : 'Merge'}
          </Button>
          <Button variant='outlined' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default MergeActName
