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

// Third-party Imports
import classnames from 'classnames'

// Type Import
import type { CustomInputVerticalData } from '@core/components/custom-inputs/types'

// Component Imports
import CustomInputVertical from '@core/components/custom-inputs/Vertical'
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

type AddEditActData = {
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
  description?: string
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

const AddEditAct = ({ open, setOpen, data }: AddEditActProps) => {
  // Vars
  const initialSelected: string = customInputData?.find(item => item.isSelected)?.value || ''

  // States
  const [selected, setSelected] = useState<string>(initialSelected)
  const [actData, setActData] = useState<AddEditActProps['data']>(initialActData)

  const handleChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setSelected(prop)
    } else {
      setSelected((prop.target as HTMLInputElement).value)
    }
  }

  useEffect(() => {
    setActData(data ?? initialActData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

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
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
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
                label='Act Name'
                name='actName'
                placeholder='Enter Act Name'
                value={actData?.actName}
                onChange={e => setActData({ ...actData, actName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                required
                rows={2}
                label='Description'
                name='description'
                placeholder='Act Description'
                inputProps={{ maxLength: 220 }}
                value={actData?.description}
                onChange={e => setActData({ ...actData, description: e.target.value })}
              />
              <Typography variant='caption' className='text-right block'>
                {220 - (actData?.description?.length || 0)} chars left
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
                label='Category'
                name='category'
                required
                value={actData?.category || ''}
                onChange={e => setActData({ ...actData, category: e.target.value })}
              >
                <MenuItem value='internal'>Internal</MenuItem>
                <MenuItem value='external'>External</MenuItem>
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
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={() => setOpen(false)} type='submit'>
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
