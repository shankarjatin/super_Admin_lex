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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import axios from 'axios'
import https from 'https'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

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

type DocumentData = {
  id?: string
  documentName: string
  act_id: number | null
  status: boolean
  date: string | null
  file: File | null
}

type AddDocumentProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: DocumentData
  selectedActId?: number | null
}

const initialDocumentData: DocumentData = {
  documentName: '',
  act_id: null,
  status: true,
  date: null,
  file: null
}

const AddDocument = ({ open, setOpen, data, selectedActId }: AddDocumentProps) => {
  // States
  const [documentData, setDocumentData] = useState<DocumentData>(initialDocumentData)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [actOptions, setActOptions] = useState<ActOption[]>([])
  const [loadingActs, setLoadingActs] = useState<boolean>(false)
  const [selectedAct, setSelectedAct] = useState<ActOption | null>(null)
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

    fetchActs()
  }, [])

  // Handle pre-selected act if provided
  useEffect(() => {
    if (selectedActId && actOptions.length > 0) {
      const act = actOptions.find(a => a.id === selectedActId)
      if (act) {
        setSelectedAct(act)
        setDocumentData(prev => ({ ...prev, act_id: act.id }))
      }
    }
  }, [selectedActId, actOptions])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (data) {
        setDocumentData(data)
        if (data.act_id && actOptions.length > 0) {
          const act = actOptions.find(a => a.id === data.act_id)
          setSelectedAct(act || null)
        }
      } else {
        setDocumentData(initialDocumentData)
        if (selectedActId && actOptions.length > 0) {
          const act = actOptions.find(a => a.id === selectedActId)
          if (act) {
            setSelectedAct(act)
            setDocumentData(prev => ({ ...prev, act_id: act.id }))
          } else {
            setSelectedAct(null)
          }
        } else {
          setSelectedAct(null)
        }
      }
      setFile(null)
      setFileError(null)
    }
  }, [open, data, selectedActId, actOptions])

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
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Only PDF, Word, and Excel files are allowed')
        return
      }

      // Set file in document data
      setDocumentData({
        ...documentData,
        file: selectedFile
      })
    }
  }

  // Handle form field changes
  const handleChange = (field: keyof DocumentData, value: any) => {
    setDocumentData({
      ...documentData,
      [field]: value
    })
  }

  // Handle act selection
  const handleActChange = (event: any, newValue: ActOption | null) => {
    setSelectedAct(newValue)
    setDocumentData({
      ...documentData,
      act_id: newValue?.id || null
    })
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!documentData.documentName) {
        setSnackbar({
          open: true,
          message: 'Please enter document name',
          severity: 'error'
        })
        return
      }

      if (!documentData.act_id) {
        setSnackbar({
          open: true,
          message: 'Please select an act',
          severity: 'error'
        })
        return
      }

      if (!file && !documentData.file) {
        setSnackbar({
          open: true,
          message: 'Please upload a document file',
          severity: 'error'
        })
        return
      }

      setLoading(true)

      let fileName = ''

      if (file) {
        const formData = new FormData()
        formData.append('file', file)

        try {
          const uploadResponse = await axiosInstance.post(
            'https://ai.lexcomply.co/v2/multer/upload?from=document',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          )

          console.log('File upload response:', uploadResponse.data)

          if (uploadResponse.data) {
            // Get 'name' from the response
            fileName = uploadResponse.data.name || 'default_name'
          } else {
            throw new Error('Empty response from file upload API')
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          throw new Error('File upload failed')
        }
      }

      // Prepare document data for submission
      const submitData = {
        docname: documentData.documentName,
        act_id: documentData.act_id,
        status: documentData.status ? 1 : 0,
        datetime: documentData.date || new Date().toISOString().split('T')[0],
        fileName: fileName // Send only the name here
      }

      // Submit document data
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/documentMaster/createDocument',
        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Document submission response:', response.data)

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Document uploaded successfully',
          severity: 'success'
        })

        // Close dialog after successful submission
        setTimeout(() => {
          setOpen(false)
        }, 1500)
      } else {
        throw new Error('Document submission failed')
      }
    } catch (error) {
      console.error('Error submitting document:', error)
      setSnackbar({
        open: true,
        message: `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          {data ? 'Edit Document' : 'Add New Document'}
          <Typography component='span' className='flex flex-col text-center'>
            {data ? 'Update document information' : 'Upload new document to the system'}
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

            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Document Name'
                  name='documentName'
                  required
                  placeholder='Enter Document Name'
                  value={documentData.documentName}
                  onChange={e => handleChange('documentName', e.target.value)}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={actOptions}
                  loading={loadingActs}
                  value={selectedAct}
                  onChange={handleActChange}
                  id='document-act-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Select Act'
                      name='act_id'
                      placeholder='Select Act'
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

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label='Date'
                    value={documentData.date ? dayjs(documentData.date) : null}
                    onChange={newValue => handleChange('date', newValue ? newValue.format('YYYY-MM-DD') : null)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='tabler-calendar' />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={documentData.status}
                      onChange={e => handleChange('status', e.target.checked)}
                      color='primary'
                      disabled={loading}
                    />
                  }
                  label='Active'
                />
              </Grid>

              <Grid item xs={12}>
                <div className='border-2 border-dashed rounded-lg p-6 relative'>
                  <input
                    type='file'
                    id='document-file'
                    onChange={handleFileChange}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                    disabled={loading}
                  />
                  <div className='flex flex-col items-center justify-center'>
                    <i className='tabler-upload text-4xl mb-2 text-primary' />
                    <Typography variant='h6' className='mb-2'>
                      {file ? file.name : 'Drag & Drop or Click to Upload'}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      Supports PDF, Word, and Excel files (Max 5MB)
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
            <Button variant='contained' onClick={handleSubmit} type='submit' disabled={loading || !!fileError}>
              {loading ? <CircularProgress size={24} /> : data ? 'Update' : 'Upload'}
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

export default AddDocument
