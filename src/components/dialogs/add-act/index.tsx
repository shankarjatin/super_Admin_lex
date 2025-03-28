'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import axios from 'axios'
import https from 'https'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
// Third-party Imports
import classnames from 'classnames'

// Type Import
import type { CustomInputVerticalData } from '@core/components/custom-inputs/types'

// Component Imports
import CustomInputVertical from '@core/components/custom-inputs/Vertical'
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

type AddEditActData = {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  actName?: string
  country?: string
  act1?: string
  act2?: string
  landmark?: string
  city?: string
  state?: string
  zipCode?: string
  act_desc?: string
  url?: string
  category?: string
  type?: string
  continent?: string
  region?: string
  subject1?: string
}

type AddEditActProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: AddEditActData
}

const countries = ['Select Country', 'France', 'Russia', 'China', 'UK', 'US']

const initialActData: AddEditActProps['data'] = {
  id: '0', // Set default id to '0'
  firstName: '',
  lastName: '',
  country: '',
  act1: '',
  act2: '',
  landmark: '',
  city: '',
  state: '',
  zipCode: ''
}

const customInputData: CustomInputVerticalData[] = [
  {
    title: 'Home',
    content: 'Delivery Time (7am - 9pm)',
    value: 'home',
    isSelected: true,
    asset: 'tabler-home'
  },
  {
    title: 'Office',
    content: 'Delivery Time (10am - 6pm)',
    value: 'office',
    asset: 'tabler-building-skyscraper'
  }
]
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const AddEditAct = ({ open, setOpen, data }: AddEditActProps) => {
  // Vars
  const initialSelected: string = customInputData?.find(item => item.isSelected)?.value || ''

  // States
  const [selected, setSelected] = useState<string>(initialSelected)
  const [actData, setActData] = useState<AddEditActProps['data']>(initialActData)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })
  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }
  const handleChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setSelected(prop)
    } else {
      setSelected((prop.target as HTMLInputElement).value)
    }
  }

  useEffect(() => {
    // Ensure the ID is always '0' even when data is provided
    setActData({ ...initialActData, ...(data || {}), id: '0' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data])

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Always ensure ID is '0' before submitting
    const formData = { ...actData, id: '0' }

    console.log('Submitting form data with ID=0:', formData)

    // Send data to API
    try {
      setLoading(true)

      // Format data as needed by the API
      const apiRequestData = {
        name: formData.name,
        act_desc: formData.act_desc,
        subject: formData.subject1,
        url: formData.url,
        industry_type: formData.type,
        continent: formData.continent,
        country: formData.country || '',
        region: formData.region || '',
        state: formData.state || '',
        category: formData.category || 'statutory',
        edit: '0'
      }

      console.log('Sending data to API:', apiRequestData)

      // Make the API call
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/actMaster/createActMaster',
        apiRequestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('API Response:', response.data)

      // Show success message
      setSnackbar({
        open: true,
        message: 'Act created successfully!',
        severity: 'success'
      })

      // Close the dialog after a short delay
      setTimeout(() => {
        setOpen(false)
      }, 1000)
    } catch (error) {
      console.error('Error creating act:', error)

      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to create act. Please try again.',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={() => {
        setOpen(false)
        setSelected(initialSelected)
      }}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
        {data ? 'Edit Act' : 'Add New Act'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit Act for future billing' : 'Add act for billing act'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>

          {/* Hidden ID field - always set to '0' */}
          <input type='hidden' name='id' value='0' />

          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Name'
                name='name'
                required
                placeholder='Enter Name'
                value={actData?.name}
                onChange={e => setActData({ ...actData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Region (Optional)'
                name='region'
                placeholder='Enter Region'
                value={actData?.region || ''}
                onChange={e => setActData({ ...actData, region: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                required
                rows={2}
                label='Description'
                name='act_desc'
                placeholder='Act Description'
                inputProps={{ maxLength: 220 }}
                value={actData?.act_desc}
                onChange={e => setActData({ ...actData, act_desc: e.target.value })}
              />
              <Typography variant='caption' className='text-right block'>
                {220 - (actData?.act_desc?.length || 0)} chars left
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='URL'
                name='url'
                placeholder='http://www.XYZ.com'
                value={actData?.url}
                onChange={e => setActData({ ...actData, url: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                required
                label='Subject 1'
                name='subject1'
                placeholder='Enter Subject'
                value={actData?.subject1 || ''}
                onChange={e => setActData({ ...actData, subject1: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Continent'
                name='continent'
                required
                value={actData?.continent || ''}
                onChange={e => setActData({ ...actData, continent: e.target.value })}
              >
                <MenuItem value='asia'>Asia</MenuItem>
                <MenuItem value='europe'>Europe</MenuItem>
                <MenuItem value='north-america'>North America</MenuItem>
                <MenuItem value='south-america'>South America</MenuItem>
                <MenuItem value='australia'>Australia</MenuItem>
                <MenuItem value='africa'>Africa</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Type'
                name='type'
                required
                value={actData?.type || ''}
                onChange={e => setActData({ ...actData, type: e.target.value })}
              >
                <MenuItem value='central'>Central</MenuItem>
                <MenuItem value='state'>State</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Display the ID in a disabled field (optional - for visibility) */}
            {/* Uncomment if you want the ID to be visible to the user */}
            {/*
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='ID'
                name='id-display'
                disabled
                value='0'
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                }}
              />
            </Grid>
            */}
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit'>
            {data ? 'Update' : 'Submit'}
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setOpen(false)
              setSelected(initialSelected)
            }}
            type='reset'
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddEditAct
