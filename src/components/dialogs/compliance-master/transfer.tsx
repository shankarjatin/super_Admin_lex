'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Third-party Imports
import axios from 'axios'
import https from 'https'

type TransferComplianceProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const TransferCompliance = ({ open, setOpen, onSuccess }: TransferComplianceProps) => {
  // States
  const [step, setStep] = useState<number>(1)
  const [complianceId, setComplianceId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // State variables for periodicity (matching PHP implementation)
  const [periodicityData, setPeriodicityData] = useState<any>(null)
  const [oldPeriodicity, setOldPeriodicity] = useState<string>('')
  const [cc_t, setCCT] = useState<string>('') // Equivalent to $cc_t in PHP
  const [pro, setPro] = useState<string>('') // Equivalent to $pro in PHP
  const [newPeriodicity, setNewPeriodicity] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [event, setEvent] = useState<string>('')
  const [eventPeriodicity, setEventPeriodicity] = useState<string>('')
  const [transferType, setTransferType] = useState<string>('')

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1)
      setComplianceId('')
      setPeriodicityData(null)
      setOldPeriodicity('')
      setCCT('')
      setPro('')
      setNewPeriodicity('')
      setDueDate('')
      setEvent('')
      setEventPeriodicity('')
      setTransferType('')
    }
  }, [open])

  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Function to fetch periodicity data - follows the PHP implementation logic
  const fetchPeriodicityData = async (id: string) => {
    try {
      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/complianceMaster/getCompliancePerodicity?id=${id}`
      )
      console.log(response.data.data)
      if (response.data.data) {
        const periodicityInfo = response.data.data

        setPeriodicityData(periodicityInfo)

        // Get periodicity from response (equivalent to $pro in PHP)
        const periodicity = periodicityInfo.periodicity || ''
        setOldPeriodicity(periodicity)
        setPro(periodicity)

        // Map periodicity to type (exactly like the PHP code)
        const ym = periodicity.toLowerCase()

        if (ym === 'one time') {
          setCCT('one')
          setTransferType('one_time')
        } else if (ym === 'event based') {
          setCCT('Event')
          setTransferType('event_base')
        } else if (ym === 'on going') {
          setCCT('ongoing')
          setTransferType('ongoing')
        } else {
          setCCT('duedate')
          setPro('duedate')
          setTransferType('due_date')
        }

        return true
      } else {
        throw new Error('Periodicity data not found')
      }
    } catch (error) {
      console.error('Error fetching periodicity data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to fetch periodicity information',
        severity: 'error'
      })
      return false
    }
  }

  // Handle continue button click
  const handleContinue = async () => {
    if (!complianceId.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a Compliance ID',
        severity: 'error'
      })
      return
    }

    setLoading(true)

    try {
      // Fetch periodicity data directly
      const periodicitySuccess = await fetchPeriodicityData(complianceId)
      if (periodicitySuccess) {
        setStep(2)
      } else {
        throw new Error('Failed to retrieve compliance information')
      }
    } catch (error) {
      console.error('Error fetching compliance:', error)
      setSnackbar({
        open: true,
        message: 'Failed to find compliance with the provided ID',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transferType) {
      setSnackbar({
        open: true,
        message: 'Please select a transfer type',
        severity: 'error'
      })
      return
    }

    setLoading(true)

    try {
      // Validate required fields based on transfer type
      if (transferType === 'due_date' && !dueDate) {
        throw new Error('Due date is required for due date periodicity')
      }

      if (transferType === 'event_base' && (!event || !eventPeriodicity)) {
        throw new Error('Event and event periodicity are required for event based periodicity')
      }

      // Submit the form to the transfer API with the DTO format
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/complianceMaster/complianceTransfer',
        {
          complianceId: Number(complianceId),
          old_pre: oldPeriodicity,
          new_pre: newPeriodicity || transferType,
          periodicity: transferType,
          due_date: dueDate || new Date().toISOString().split('T')[0],
          event: event || 'N/A',
          event_periodicity: eventPeriodicity || 'N/A'
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
          message: 'Compliance transferred successfully!',
          severity: 'success'
        })

        // Close dialog and trigger success callback
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Transfer failed')
      }
    } catch (error) {
      console.error('Error transferring compliance:', error)
      setSnackbar({
        open: true,
        message: `Failed to transfer compliance: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        maxWidth='sm'
        fullWidth
        scroll='body'
        onClose={() => !loading && setOpen(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          Transfer Compliance
          <Typography component='span' className='flex flex-col text-center'>
            Transfer compliance from one periodicity to another
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <DialogCloseButton onClick={() => !loading && setOpen(false)} disableRipple disabled={loading}>
              <i className='tabler-x' />
            </DialogCloseButton>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Step 1: Enter Compliance ID */}
            {!loading && step === 1 && (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Compliance ID'
                    name='complianceId'
                    required
                    placeholder='Enter Compliance ID'
                    value={complianceId}
                    onChange={e => setComplianceId(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>#</InputAdornment>
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant='contained' onClick={handleContinue} disabled={!complianceId.trim()}>
                      Continue
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Step 2: Transfer Compliance Form */}
            {!loading && step === 2 && periodicityData && (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    From:
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 }}>
                    <Typography variant='body1'>
                      <strong>ID:</strong> {complianceId}
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Description:</strong> {periodicityData.description || 'N/A'}
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Current Periodicity:</strong> {oldPeriodicity || 'N/A'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    Transfer To:
                  </Typography>

                  {/* Display current periodicity select - similar to PHP implementation */}
                  <CustomTextField select fullWidth label='Current Periodicity' value={pro} disabled sx={{ mb: 2 }}>
                    {/* Match the PHP options exactly */}
                    <MenuItem value={pro} selected={cc_t === 'one'}>
                      {pro}
                    </MenuItem>
                    <MenuItem value={pro} selected={cc_t === 'duedate'}>
                      {pro}
                    </MenuItem>
                    <MenuItem value={pro} selected={cc_t === 'Event'}>
                      {pro}
                    </MenuItem>
                    <MenuItem value={pro} selected={cc_t === 'ongoing'}>
                      {pro}
                    </MenuItem>
                  </CustomTextField>

                  {/* Select new periodicity type */}
                  <CustomTextField
                    select
                    fullWidth
                    label='New Periodicity Type'
                    name='transferType'
                    required
                    value={transferType}
                    onChange={e => setTransferType(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value='one_time'>One Time</MenuItem>
                    <MenuItem value='due_date'>Due Date</MenuItem>
                    <MenuItem value='event_base'>Event Based</MenuItem>
                    <MenuItem value='ongoing'>Ongoing</MenuItem>
                  </CustomTextField>

                  {/* Conditional fields based on selected periodicity type */}
                  {transferType === 'due_date' && (
                    <CustomTextField
                      fullWidth
                      label='Due Date'
                      type='date'
                      name='dueDate'
                      required
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}

                  {transferType === 'event_base' && (
                    <>
                      <CustomTextField
                        fullWidth
                        label='Event'
                        name='event'
                        required
                        value={event}
                        onChange={e => setEvent(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder='Enter event name'
                      />
                      <CustomTextField
                        fullWidth
                        label='Event Periodicity'
                        name='eventPeriodicity'
                        required
                        value={eventPeriodicity}
                        onChange={e => setEventPeriodicity(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder='Enter event periodicity'
                      />
                    </>
                  )}

                  {/* New periodicity description field */}
                  <CustomTextField
                    fullWidth
                    label='New Periodicity Description'
                    name='newPeriodicity'
                    required
                    value={newPeriodicity}
                    onChange={e => setNewPeriodicity(e.target.value)}
                    sx={{ mb: 2 }}
                    placeholder='Enter new periodicity description'
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            {step === 1 ? (
              <Button variant='tonal' color='secondary' onClick={() => !loading && setOpen(false)} disabled={loading}>
                Cancel
              </Button>
            ) : (
              <>
                <Button variant='contained' type='submit' disabled={loading || !transferType}>
                  {loading ? <CircularProgress size={24} /> : 'Transfer'}
                </Button>
                <Button variant='tonal' color='secondary' onClick={() => !loading && setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
              </>
            )}
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TransferCompliance
