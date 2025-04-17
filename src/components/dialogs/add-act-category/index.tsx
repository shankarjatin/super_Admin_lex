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
interface UrlOption {
  id?: number
  url: string
}

// Define the list of available law categories
const lawCategories = [
  'Administrative Laws',
  'Advertising Laws',
  'Banking Laws',
  'Corporate Laws',
  'Customs',
  'Direct Tax',
  'Electronics Laws',
  'Electricals Laws',
  'Environmental Laws',
  'Food and Safety Laws',
  'Indirect Tax',
  'Industrial Laws',
  'Information Technology Laws',
  'Insurance Laws',
  'IPR Laws',
  'Labour Laws',
  'Others'
]

type AddActCategoryProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

const AddActCategory = ({ open, setOpen, onSuccess }: AddActCategoryProps) => {
  // States
  const [selectedUrl, setSelectedUrl] = useState<UrlOption | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [urlOptions, setUrlOptions] = useState<UrlOption[]>([])
  const [loadingUrls, setLoadingUrls] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Fetch URLs for dropdown when component mounts
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoadingUrls(true)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/newsUrl')

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // Convert to required format if needed
          const formattedUrls = response.data.data.map((item: any, index: number) => ({
            id: index,
            url: item
          }))
          setUrlOptions(formattedUrls)
        } else {
          setUrlOptions([])
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('Error fetching URLs:', error)
        setSnackbar({
          open: true,
          message: 'Failed to load URLs. Please try again.',
          severity: 'error'
        })
      } finally {
        setLoadingUrls(false)
      }
    }

    if (open) {
      fetchUrls()
    }
  }, [open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedUrl(null)
      setSelectedCategory(null)
    }
  }, [open])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!selectedUrl) {
      setSnackbar({
        open: true,
        message: 'Please select a URL',
        severity: 'error'
      })
      return
    }

    if (!selectedCategory) {
      setSnackbar({
        open: true,
        message: 'Please select a Law Category',
        severity: 'error'
      })
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/actMaster/actCategory',
        {
          url: selectedUrl.url,
          tax: selectedCategory
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
          message: 'Act category added successfully!',
          severity: 'success'
        })

        // Close dialog and trigger success callback after delay
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error adding act category:', error)
      setSnackbar({
        open: true,
        message: `Failed to add act category: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          Add Act Category
          <Typography component='span' className='flex flex-col text-center'>
            Map a URL to a Law Category
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
                  Select a URL and Law Category to create a new act category mapping.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={urlOptions}
                  loading={loadingUrls}
                  value={selectedUrl}
                  onChange={(_, newValue) => setSelectedUrl(newValue)}
                  id='url-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Select URL'
                      name='url'
                      placeholder='Choose a URL'
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

              <Grid item xs={12} className='flex items-center justify-center'>
                <div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary-100'>
                  <i className='tabler-link text-xl text-primary' />
                </div>
              </Grid>

              <Grid item xs={12}>
                <CustomAutocomplete
                  fullWidth
                  options={lawCategories}
                  value={selectedCategory}
                  onChange={(_, newValue) => setSelectedCategory(newValue)}
                  id='law-category-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Law Category'
                      name='category'
                      placeholder='Select a law category'
                    />
                  )}
                  disabled={loading}
                />
              </Grid>

              {selectedUrl && selectedCategory && (
                <Grid item xs={12}>
                  <Alert severity='info' sx={{ mt: 2 }}>
                    You are about to map URL "{selectedUrl.url}" to the category "{selectedCategory}".
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button
              variant='contained'
              onClick={handleSubmit}
              type='submit'
              disabled={loading || !selectedUrl || !selectedCategory}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Category'}
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

export default AddActCategory
