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
  const [complianceData, setComplianceData] = useState<any>(null)
  const [transferType, setTransferType] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1)
      setComplianceId('')
      setComplianceData(null)
      setTransferType('')
    }
  }, [open])

  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
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
      // Fetch compliance details based on ID
      const response = await axiosInstance.get(`/complianceMaster/getCompliance?id=${complianceId}`)

      if (response.data && response.data.success && response.data.data) {
        setComplianceData(response.data.data)
        setStep(2)
      } else {
        throw new Error('Compliance not found')
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

  // Handle form submission
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
      // Call API to transfer compliance
      const response = await axiosInstance.post(
        '/complianceMaster/transferCompliance',
        {
          complianceId,
          transferType
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
            Transfer compliance from one entity to another
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

            {!loading && step === 2 && complianceData && (
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    From:
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 }}>
                    <Typography variant='body1'>
                      <strong>ID:</strong> {complianceData.id}
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Description:</strong> {complianceData.description}
                    </Typography>
                    <Typography variant='body1'>
                      <strong>Current Entity:</strong> {complianceData.entity || 'N/A'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    To:
                  </Typography>
                  <CustomTextField
                    select
                    fullWidth
                    label='Transfer Type'
                    name='transferType'
                    required
                    value={transferType}
                    onChange={e => setTransferType(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value='one_time'>One Time</MenuItem>
                    <MenuItem value='due_date'>Due Date</MenuItem>
                    <MenuItem value='event_base'>Event Base</MenuItem>
                    <MenuItem value='ongoing'>Ongoing</MenuItem>
                  </CustomTextField>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            {step === 2 && (
              <Button variant='contained' type='submit' disabled={loading || !transferType}>
                {loading ? <CircularProgress size={24} /> : 'Transfer'}
              </Button>
            )}
            <Button variant='tonal' color='secondary' onClick={() => !loading && setOpen(false)} disabled={loading}>
              Cancel
            </Button>
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
