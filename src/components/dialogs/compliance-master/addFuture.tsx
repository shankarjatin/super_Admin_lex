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
import Divider from '@mui/material/Divider'
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

// Define interfaces for API responses and form data
interface ActOption {
  id: number
  actId: number
  name: string
}

type FutureComplianceData = {
  actId: number | null
  file: File | null
}

type AddFutureComplianceProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

const initialFormData: FutureComplianceData = {
  actId: null,
  file: null
}

const AddFutureCompliance = ({ open, setOpen, onSuccess }: AddFutureComplianceProps) => {
  // States
  const [formData, setFormData] = useState<FutureComplianceData>(initialFormData)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [actOptions, setActOptions] = useState<ActOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const [selectedAct, setSelectedAct] = useState<ActOption | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Fetch acts for dropdowns when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)

        // Fetch acts
        const actsResponse = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/getInternationalActDrop')
        if (actsResponse.data) {
          setActOptions(actsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching options:', error)
        setSnackbar({
          open: true,
          message: 'Failed to load acts. Please try again.',
          severity: 'error'
        })
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData(initialFormData)
      setSelectedAct(null)
      setFile(null)
      setFileError(null)
    }
  }, [open])

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    setFileError(null)

    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError('File size should not exceed 5MB')
        return
      }

      // Validate file type (PDF, DOCX, DOC, XLS, XLSX, etc.)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/rtf',
        'application/vnd.oasis.opendocument.text'
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Only document files (PDF, Word, Excel, etc.) are allowed')
        return
      }

      // Set file in form data
      setFormData({
        ...formData,
        file: selectedFile
      })
    }
  }

  // Handle act selection
  const handleActChange = (event: any, newValue: ActOption | null) => {
    setSelectedAct(newValue)
    setFormData({
      ...formData,
      actId: newValue?.id || null
    })
  }

  // Handle form submission - UPDATED TO SEND FILE BLOB
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.actId) {
        setSnackbar({
          open: true,
          message: 'Please select an Act',
          severity: 'error'
        })
        return
      }

      if (!file) {
        setSnackbar({
          open: true,
          message: 'Please upload a document',
          severity: 'error'
        })
        return
      }

      setLoading(true)

      // Create FormData to send the file and actId directly
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('actId', formData.actId?.toString() || '')
      // formDataObj.append('from', 'compliance')

      console.log('Sending file and actId directly to API')

      // Send the formData directly to the addFutureCompliance endpoint
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/complianceMaster/addFutureCompliance?from=compliance',
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data' // Important for file upload
          }
        }
      )

      console.log('API response:', response.data)

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Future compliance document uploaded successfully',
          severity: 'success'
        })

        // Close dialog after successful submission and trigger success callback
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error submitting future compliance:', error)

      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error response status:', error.response.status)
      } else if (error.request) {
        console.error('No response received:', error.request)
      }

      setSnackbar({
        open: true,
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        fullWidth
        scroll='body'
        onClose={() => !loading && setOpen(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          Add Future Compliance Document
          <Typography component='span' className='flex flex-col text-center'>
            Upload document for future compliance
          </Typography>
        </DialogTitle>

        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <DialogCloseButton onClick={() => !loading && setOpen(false)} disableRipple disabled={loading}>
              <i className='tabler-x' />
            </DialogCloseButton>

            {loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10'>
                <CircularProgress />
              </div>
            )}

            <Grid container spacing={4}>
              {/* Act Selection */}
              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={actOptions}
                  loading={loadingOptions}
                  value={selectedAct}
                  onChange={handleActChange}
                  id='future-act-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Select Act'
                      name='actId'
                      placeholder='Select Act'
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
                  getOptionLabel={option => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={loading}
                />
              </Grid>

              {/* Document Upload Section */}
              <Grid item xs={12}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='textSecondary'>
                    Upload Document
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <div className='border-2 border-dashed rounded-lg p-6 relative'>
                  <input
                    type='file'
                    id='future-compliance-file'
                    accept='.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.odt'
                    onChange={handleFileChange}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                    disabled={loading}
                  />
                  <div className='flex flex-col items-center justify-center'>
                    <i className='tabler-file-upload text-4xl mb-2 text-primary' />
                    <Typography variant='h6' className='mb-2'>
                      {file ? file.name : 'Drag & Drop or Click to Upload Document'}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      Supports PDF, Word, Excel and other document formats (Max 5MB)
                    </Typography>
                    {file && (
                      <Typography variant='body2' className='mt-2'>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    )}
                    {fileError && (
                      <Typography variant='body2' color='error' className='mt-2'>
                        {fileError}
                      </Typography>
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={loading || !formData.actId || !file || !!fileError}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={() => !loading && setOpen(false)} disabled={loading}>
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

export default AddFutureCompliance
