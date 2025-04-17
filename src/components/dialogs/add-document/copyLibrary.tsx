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
interface ActOption {
  id: number
  actId: number
  name: string
}

type CopyLibraryProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

const CopyLibrary = ({ open, setOpen, onSuccess }: CopyLibraryProps) => {
  // States
  const [fromAct, setFromAct] = useState<ActOption | null>(null)
  const [toAct, setToAct] = useState<ActOption | null>(null)
  const [actOptions, setActOptions] = useState<ActOption[]>([])
  const [loadingActs, setLoadingActs] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Fetch acts for dropdown when component mounts
  useEffect(() => {
    const fetchActs = async () => {
      try {
        setLoadingActs(true)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/getInternationalActDrop')
        setActOptions(response.data)
      } catch (error) {
        console.error('Error fetching acts:', error)
        setSnackbar({
          open: true,
          message: 'Failed to load acts. Please try again.',
          severity: 'error'
        })
      } finally {
        setLoadingActs(false)
      }
    }

    if (open) {
      fetchActs()
    }
  }, [open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFromAct(null)
      setToAct(null)
    }
  }, [open])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!fromAct) {
      setSnackbar({
        open: true,
        message: 'Please select a source act',
        severity: 'error'
      })
      return
    }

    if (!toAct) {
      setSnackbar({
        open: true,
        message: 'Please select a destination act',
        severity: 'error'
      })
      return
    }

    if (fromAct.id === toAct.id) {
      setSnackbar({
        open: true,
        message: 'Source and destination acts cannot be the same',
        severity: 'error'
      })
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/documentMaster/copyLibrary',
        {
          fromAct: fromAct.id,
          toAct: toAct.id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Library copied successfully!',
          severity: 'success'
        })

        // Close dialog and trigger success callback after delay
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Copy operation failed')
      }
    } catch (error) {
      console.error('Error copying library:', error)
      setSnackbar({
        open: true,
        message: `Failed to copy library: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle close function
  const handleClose = () => {
    if (!loading) {
      setOpen(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        maxWidth='md'
        fullWidth
        scroll='body'
        onClose={handleClose}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          Copy Document Library
          <Typography component='span' className='flex flex-col text-center'>
            Copy all documents from one act to another
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <DialogCloseButton onClick={handleClose} disableRipple disabled={loading}>
              <i className='tabler-x' />
            </DialogCloseButton>

            {loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10'>
                <CircularProgress />
              </div>
            )}

            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' className='mb-4'>
                  Select the source and destination acts to copy the document library. All documents from the source act
                  will be copied to the destination act.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={actOptions}
                  loading={loadingActs}
                  value={fromAct}
                  onChange={(_, newValue) => setFromAct(newValue)}
                  id='copy-from-act-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Copy From Act'
                      name='fromAct'
                      placeholder='Select source act'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingActs ? <CircularProgress color='inherit' size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  getOptionLabel={option => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} className='flex items-center justify-center'>
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary-100'>
                  <i className='tabler-arrow-down text-xl text-primary' />
                </div>
              </Grid>

              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={actOptions}
                  loading={loadingActs}
                  value={toAct}
                  onChange={(_, newValue) => setToAct(newValue)}
                  id='copy-to-act-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Copy To Act'
                      name='toAct'
                      placeholder='Select destination act'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingActs ? <CircularProgress color='inherit' size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  getOptionLabel={option => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={loading}
                />
              </Grid>

              {fromAct && toAct && (
                <Grid item xs={12}>
                  <Alert severity='info' sx={{ mt: 2 }}>
                    You are about to copy all documents from "{fromAct.name}" to "{toAct.name}".
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='contained' onClick={handleSubmit} type='submit' disabled={loading || !fromAct || !toAct}>
              {loading ? <CircularProgress size={24} /> : 'Copy Library'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose} type='reset' disabled={loading}>
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default CopyLibrary
