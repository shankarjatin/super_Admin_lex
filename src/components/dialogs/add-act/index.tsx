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
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Country lists by continent
const countriesByContinent = {
  asia: ['Afghanistan', 'Brunei', 'China', 'India', 'Japan', 'Malaysia', 'Singapore', 'Thailand'],
  europe: ['France', 'Germany', 'Italy', 'Spain', 'UK', 'Russia'],
  'north-america': ['Canada', 'Mexico', 'USA'],
  'south-america': ['Argentina', 'Brazil', 'Chile', 'Colombia'],
  australia: ['Australia', 'New Zealand', 'Fiji'],
  africa: ['Egypt', 'Kenya', 'Nigeria', 'South Africa']
}

type AddEditActData = {
  id?: string
  name?: string
  actName?: string
  act_desc?: string
  url?: string
  category?: string
  continent?: string
  country?: string
  type?: string
  region?: string
  subject1?: string
  status?: boolean
  industryType?: 'service' | 'manufacturing' | 'trading'
}

type AddEditActProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: AddEditActData
  onSuccess?: () => void
}

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const initialActData: AddEditActData = {
  id: '0',
  name: '',
  actName: '',
  act_desc: '',
  url: '',
  category: 'internal',
  continent: 'asia',
  country: '',
  type: 'central',
  region: '',
  subject1: '',
  status: true,
  industryType: 'service'
}

const AddEditAct = ({ open, setOpen, data, onSuccess }: AddEditActProps) => {
  // States
  const [actData, setActData] = useState<AddEditActData>(initialActData)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })
  const [availableCountries, setAvailableCountries] = useState<string[]>(countriesByContinent.asia || [])

  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Handle continent change and update country options
  const handleContinentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const continent = e.target.value
    setActData({ ...actData, continent, country: '' })
    setAvailableCountries(countriesByContinent[continent as keyof typeof countriesByContinent] || [])
  }

  // Reset form when dialog closes or new data is provided
  useEffect(() => {
    if (data) {
      setActData({ ...initialActData, ...data })

      // Update country list based on provided continent
      if (data.continent) {
        setAvailableCountries(countriesByContinent[data.continent as keyof typeof countriesByContinent] || [])
      }
    } else {
      setActData(initialActData)
      setAvailableCountries(countriesByContinent.asia || [])
    }
  }, [open, data])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Format data as needed by the API
      const apiRequestData = {
        name: actData.name,
        actName: actData.actName,
        act_desc: actData.act_desc,
        url: actData.url,
        category: actData.category,
        continent: actData.continent,
        country: actData.country || '',
        type: actData.type,
        region: actData.region || '',
        subject1: actData.subject1,
        status: actData.status ? 'yes' : 'no',
        industryType: actData.industryType,
        edit: data && data.id && data.id !== '0' ? '1' : '0',
        id: data && data.id ? data.id : '0'
      }

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

      // Show success message
      setSnackbar({
        open: true,
        message: data?.id ? 'Act updated successfully!' : 'Act created successfully!',
        severity: 'success'
      })

      // Close dialog and call success callback after delay
      setTimeout(() => {
        setOpen(false)
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (error) {
      console.error('Error saving act:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save act. Please try again.',
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
      fullWidth
      scroll='body'
      onClose={() => !loading && setOpen(false)}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
        {data && data.id && data.id !== '0' ? 'Edit Act' : 'Add New Act'}
        <Typography component='span' className='flex flex-col text-center'>
          {data && data.id && data.id !== '0' ? 'Edit existing act details' : 'Create a new act in the system'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={() => !loading && setOpen(false)} disableRipple disabled={loading}>
            <i className='tabler-x' />
          </DialogCloseButton>

          {loading && (
            <div className='flex justify-center mt-4 mb-8'>
              <CircularProgress />
            </div>
          )}

          <Grid container spacing={6}>
            {/* Name Field */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Name'
                name='name'
                required
                placeholder='Enter Name'
                value={actData?.name || ''}
                onChange={e => setActData({ ...actData, name: e.target.value })}
                disabled={loading}
              />
            </Grid>

            {/* Act Name Field */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Act Name'
                name='actName'
                placeholder='Enter Act Name'
                value={actData?.actName || ''}
                onChange={e => setActData({ ...actData, actName: e.target.value })}
                disabled={loading}
              />
            </Grid>

            {/* Description Field */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                required
                rows={3}
                label='Description'
                name='act_desc'
                placeholder='Act Description'
                inputProps={{ maxLength: 220 }}
                value={actData?.act_desc || ''}
                onChange={e => setActData({ ...actData, act_desc: e.target.value })}
                disabled={loading}
                helperText={`${220 - (actData?.act_desc?.length || 0)} chars left`}
              />
            </Grid>

            {/* URL Field */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='URL'
                name='url'
                placeholder='http://www.XYZ.com'
                value={actData?.url || ''}
                onChange={e => setActData({ ...actData, url: e.target.value })}
                disabled={loading}
              />
            </Grid>

            {/* Category Dropdown */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Category'
                name='category'
                required
                value={actData?.category || 'internal'}
                onChange={e => setActData({ ...actData, category: e.target.value })}
                disabled={loading}
              >
                <MenuItem value='internal'>Internal</MenuItem>
                <MenuItem value='external'>External</MenuItem>
                <MenuItem value='statutory'>Statutory</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Continent Dropdown */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Continent'
                name='continent'
                required
                value={actData?.continent || 'asia'}
                onChange={handleContinentChange}
                disabled={loading}
              >
                <MenuItem value='asia'>Asia</MenuItem>
                <MenuItem value='europe'>Europe</MenuItem>
                <MenuItem value='north-america'>North America</MenuItem>
                <MenuItem value='south-america'>South America</MenuItem>
                <MenuItem value='australia'>Australia</MenuItem>
                <MenuItem value='africa'>Africa</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Country Dropdown - populated based on selected continent */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Country'
                name='country'
                value={actData?.country || ''}
                onChange={e => setActData({ ...actData, country: e.target.value })}
                disabled={loading || availableCountries.length === 0}
              >
                <MenuItem value=''>Select Country</MenuItem>
                {availableCountries.map(country => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            {/* Type Dropdown */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Type'
                name='type'
                required
                value={actData?.type || 'central'}
                onChange={e => setActData({ ...actData, type: e.target.value })}
                disabled={loading}
              >
                <MenuItem value='central'>Central</MenuItem>
                <MenuItem value='state'>State</MenuItem>
                <MenuItem value='local'>Local</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Region Field */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Region (Optional)'
                name='region'
                placeholder='Enter Region'
                value={actData?.region || ''}
                onChange={e => setActData({ ...actData, region: e.target.value })}
                disabled={loading}
              />
            </Grid>

            {/* Subject 1 Field */}
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                required
                label='Subject 1'
                name='subject1'
                placeholder='Enter Subject'
                value={actData?.subject1 || ''}
                onChange={e => setActData({ ...actData, subject1: e.target.value })}
                disabled={loading}
              />
            </Grid>

            {/* Status Switch */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={actData?.status === undefined ? true : actData.status}
                    onChange={e => setActData({ ...actData, status: e.target.checked })}
                    name='status'
                    color='primary'
                    disabled={loading}
                  />
                }
                label={
                  <Typography>
                    Status: <strong>{actData?.status === false ? 'Inactive' : 'Active'}</strong>
                  </Typography>
                }
              />
            </Grid>

            {/* Industry Type Radio Group */}
            <Grid item xs={12}>
              <FormControl component='fieldset' disabled={loading}>
                <FormLabel component='legend'>Industry Type</FormLabel>
                <RadioGroup
                  row
                  name='industryType'
                  value={actData?.industryType || 'service'}
                  onChange={e =>
                    setActData({ ...actData, industryType: e.target.value as 'service' | 'manufacturing' | 'trading' })
                  }
                >
                  <FormControlLabel value='service' control={<Radio />} label='Service' />
                  <FormControlLabel value='manufacturing' control={<Radio />} label='Manufacturing' />
                  <FormControlLabel value='trading' control={<Radio />} label='Trading' />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : data && data.id && data.id !== '0' ? 'Update' : 'Submit'}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default AddEditAct
