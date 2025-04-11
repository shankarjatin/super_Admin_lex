'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'

// Create axios instance for API calls with SSL verification disabled
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

type AddExcelProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

const AddExcel = ({ open, setOpen, onSuccess }: AddExcelProps) => {
  // States
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    setFileError(null)

    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('File size should not exceed 10MB')
        return
      }

      // Validate file type (Excel only)
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Only Excel files (.xls, .xlsx) are allowed')
        return
      }
    }
  }

  // Reset component when dialog closes
  const handleClose = () => {
    if (!loading) {
      setFile(null)
      setFileError(null)
      setOpen(false)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!file) {
        setSnackbar({
          open: true,
          message: 'Please upload an Excel file',
          severity: 'error'
        })
        return
      }

      setLoading(true)

      // Create FormData to append the file
      const formData = new FormData()
      formData.append('file', file)

      console.log('Uploading file:', file.name, 'Size:', (file.size / 1024).toFixed(2) + 'KB')

      // Upload Excel file to the new API endpoint
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/complianceMaster/addBulkCompliance?from=compliance',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data' // Required for file upload
          }
        }
      )

      console.log('Bulk compliance upload response:', response.data)

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Bulk compliance data uploaded successfully',
          severity: 'success'
        })

        // Close dialog after successful submission
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Bulk upload failed')
      }
    } catch (error) {
      console.error('Error uploading bulk compliance data:', error)

      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error response status:', error.response.status)
      } else if (error.request) {
        console.error('No response received:', error.request)
      }

      setSnackbar({
        open: true,
        message: `Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        scroll='body'
        onClose={handleClose}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          Bulk Add Compliance
          <Typography component='span' className='flex flex-col text-center'>
            Import multiple compliance records using Excel spreadsheet
          </Typography>
        </DialogTitle>
        <form onSubmit={e => e.preventDefault()}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <DialogCloseButton onClick={handleClose} disableRipple disabled={loading}>
              <i className='tabler-x' />
            </DialogCloseButton>

            {loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10'>
                <CircularProgress />
              </div>
            )}

            {/* File Upload Section */}
            <div className='border-2 border-dashed rounded-lg p-8 relative mt-4'>
              <input
                type='file'
                id='excel-file'
                onChange={handleFileChange}
                className='absolute inset-0 opacity-0 cursor-pointer'
                disabled={loading}
                accept='.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              />
              <div className='flex flex-col items-center justify-center'>
                <i className='tabler-table-import text-4xl mb-4 text-primary' />
                <Typography variant='h6' className='mb-2'>
                  {file ? file.name : 'Drag & Drop or Click to Upload Excel'}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Supports Excel (.xls, .xlsx) files only
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

            {/* Download Sample Template */}
            <div className='mt-4 text-center'>
              <Button
                variant='text'
                color='primary'
                startIcon={<i className='tabler-download' />}
                href='https://ai.lexcomply.co/v2/api/complianceMaster/downloadSampleExcel'
                target='_blank'
                download
              >
                Download Sample Template
              </Button>
            </div>
          </DialogContent>
          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='contained' onClick={handleSubmit} disabled={loading || !!fileError || !file}>
              {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>
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

export default AddExcel
