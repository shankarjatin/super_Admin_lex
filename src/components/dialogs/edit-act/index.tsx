'use client'

// React Imports
import { useEffect, useState, ChangeEvent } from 'react'

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
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Type Import
import type { CustomInputVerticalData } from '@core/components/custom-inputs/types'

// Component Imports
import CustomInputVertical from '@core/components/custom-inputs/Vertical'
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Add interface for API response data matching
interface InternationalActResponse {
  id: string
  act_id: string
  category: string
  continent: string
  country: string
  state: string
  city: string
  region: string
  isDeleted: string
  actId: number
  actName: string
  actDescription: string
}

type EditActData = {
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
  industry_type?: string
  continent?: string
  region?: string
  subject1?: string
}

type EditActProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: InternationalActResponse | EditActData | null
  isLoading?: boolean
}

const countries = ['Select Country', 'France', 'Russia', 'China', 'UK', 'US']

const initialActData: EditActData = {
  name: '',
  actName: '',
  firstName: '',
  lastName: '',
  country: '',
  act1: '',
  act2: '',
  landmark: '',
  city: '',
  state: '',
  zipCode: '',
  act_desc: '',
  url: '',
  category: '',
  industry_type: '',
  continent: '',
  region: '',
  subject1: ''
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

const EditAct = ({ open, setOpen, data, isLoading = false }: EditActProps) => {
  // Vars
  const initialSelected: string = customInputData?.find(item => item.isSelected)?.value || ''

  // States
  const [selected, setSelected] = useState<string>(initialSelected)
  const [actData, setActData] = useState<EditActData>(initialActData)
  const [formTouched, setFormTouched] = useState(false)

  const handleChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setSelected(prop)
    } else {
      setSelected((prop.target as HTMLInputElement).value)
    }
    setFormTouched(true)
  }

  // Format and set form data when API data is received
  useEffect(() => {
    if (!data) {
      setActData(initialActData)
      setFormTouched(false)
      return
    }

    console.log('Received data for edit form:', data)

    // Check if data is coming from the API (InternationalActResponse)
    if ('actId' in data || 'act_id' in data) {
      const apiData = data as InternationalActResponse

      setActData({
        id: apiData.actId.toString(),
        name: apiData.actName || '',
        actName: apiData.actName || '',
        act_desc: apiData.actDescription || '',
        country: apiData.country || '',
        state: apiData.state || '',
        city: apiData.city || '',
        category: apiData.category?.toLowerCase() || '',
        continent: apiData.continent?.toLowerCase() || '',
        region: apiData.region || '',
        // Default values for fields not in API response
        industry_type: apiData.category === 'State' ? 'state' : 'central',
        url: '',
        subject1: ''
      })
    } else {
      // If it's already in the right format, just use it
      setActData({
        ...initialActData,
        ...data
      })
    }

    setFormTouched(false)
  }, [data, open])

  // Handle field change
  const handleFieldChange = (field: keyof EditActData, value: string) => {
    setActData(prev => ({
      ...prev,
      [field]: value
    }))
    setFormTouched(true)
  }

  // Form submission handler
  const handleSubmit = () => {
    console.log('Submitting updated act data:', actData)
    // Add your API call to update the act here

    // Close the dialog after submission
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={() => {
        if (!isLoading) {
          setOpen(false)
          setSelected(initialSelected)
        }
      }}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
        Edit Act
        <Typography component='span' className='flex flex-col text-center'>
          Edit Act for future billing
          {isLoading && <CircularProgress size={24} className='mx-auto mt-2' />}
        </Typography>
      </DialogTitle>
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={() => setOpen(false)} disableRipple disabled={isLoading}>
            <i className='tabler-x' />
          </DialogCloseButton>

          {/* Hidden field for ID */}
          <input type='hidden' name='id' value={actData?.id || '0'} />

          {isLoading ? (
            <div className='flex justify-center py-8'>
              <CircularProgress />
            </div>
          ) : (
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Name'
                  name='name'
                  required
                  placeholder='Enter Name'
                  value={actData?.name || ''}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Act Name'
                  name='actName'
                  placeholder='Enter Act Name'
                  value={actData?.actName || ''}
                  onChange={e => handleFieldChange('actName', e.target.value)}
                  disabled={isLoading}
                />
              </Grid> */}
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
                  value={actData?.act_desc || ''}
                  onChange={e => handleFieldChange('act_desc', e.target.value)}
                  disabled={isLoading}
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
                  value={actData?.url || ''}
                  onChange={e => handleFieldChange('url', e.target.value)}
                  disabled={isLoading}
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
                  onChange={e => handleFieldChange('subject1', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Category'
                  name='category'
                  required
                  value={actData?.category || ''}
                  onChange={e => handleFieldChange('category', e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value='internal'>Internal</MenuItem>
                  <MenuItem value='external'>External</MenuItem>
                  <MenuItem value='statutory'>Statutory</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Continent'
                  name='continent'
                  required
                  value={actData?.continent || ''}
                  onChange={e => handleFieldChange('continent', e.target.value)}
                  disabled={isLoading}
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
                  name='industry_type'
                  required
                  value={actData?.industry_type || ''}
                  onChange={e => handleFieldChange('industry_type', e.target.value)}
                  disabled={isLoading}
                >
                  <MenuItem value='central'>Central</MenuItem>
                  <MenuItem value='state'>State</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Country'
                  name='country'
                  placeholder='Enter Country'
                  value={actData?.country || ''}
                  onChange={e => handleFieldChange('country', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Region (Optional)'
                  name='region'
                  placeholder='Enter Region'
                  value={actData?.region || ''}
                  onChange={e => handleFieldChange('region', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              {/* Add State field */}
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='State'
                  name='state'
                  placeholder='Enter State'
                  value={actData?.state || ''}
                  onChange={e => handleFieldChange('state', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>
              {/* Add City field if present in data */}
              {actData?.city && (
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='City'
                    name='city'
                    placeholder='Enter City'
                    value={actData?.city || ''}
                    onChange={e => handleFieldChange('city', e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={isLoading || (!formTouched && !!data)}>
            Update
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setOpen(false)
              setSelected(initialSelected)
            }}
            type='reset'
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditAct
