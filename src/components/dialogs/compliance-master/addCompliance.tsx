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
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Interface for Act dropdown
interface ActOption {
  id: number
  name: string
}

// Type definition for form data
type ComplianceFormData = {
  id?: string
  edit?: string
  description: string
  app_geog: string
  state: string
  location: string
  event: string
  event_periodicity: string
  application: string
  exemption: string
  section: string
  sub_section: string
  rule: string
  sub_head: string
  rule_name: string
  criticality: string
  periodicity: string
  applicable_online: string
  site: string
  act_id: number | null
  provision: string
  due_date: string
  triggers: string
  department: string
  agency: string
  agency_add: string
  form_name: string
  form_purpose: string
  potential_impact: string
  remarks: string
  key1: string
  status: number
  recode?: number
  timestampp: string
  expiry_date: string
  legal_date: string
  wef_date: string
  wef_status: number
}

// Type definition for component props
type AddComplianceProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: Partial<ComplianceFormData>
  onSuccess?: () => void
}

// Mock data for dropdowns
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Other']
const criticalities = ['High', 'Medium', 'Low']
const periodicities = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'One-time', 'On Event']
const applicableOnline = ['Yes', 'No', 'Optional']

// Default empty form data
const initialFormData: ComplianceFormData = {
  description: '',
  app_geog: '',
  state: '',
  location: '',
  event: '',
  event_periodicity: '',
  application: '',
  exemption: '',
  section: '',
  sub_section: '',
  rule: '',
  sub_head: '',
  rule_name: '',
  criticality: 'Medium',
  periodicity: 'Monthly',
  applicable_online: 'No',
  site: '',
  act_id: null,
  provision: '',
  due_date: '',
  triggers: '',
  department: '',
  agency: '',
  agency_add: '',
  form_name: '',
  form_purpose: '',
  potential_impact: '',
  remarks: '',
  key1: '',
  status: 1,
  timestampp: new Date().toISOString(),
  expiry_date: '',
  legal_date: '',
  wef_date: '',
  wef_status: 1
}

// Create axios instance
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const AddCompliance = ({ open, setOpen, data, onSuccess }: AddComplianceProps) => {
  // States
  const [formData, setFormData] = useState<ComplianceFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [actOptions, setActOptions] = useState<ActOption[]>([])
  const [loadingActs, setLoadingActs] = useState(false)
  const [selectedAct, setSelectedAct] = useState<ActOption | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
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

        if (response.data && Array.isArray(response.data)) {
          setActOptions(response.data)
        } else {
          console.error('Invalid act data format:', response.data)
        }
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

  // Reset form when dialog closes or data changes
  useEffect(() => {
    if (open) {
      if (data) {
        const mergedData = { ...initialFormData, ...data }
        setFormData(mergedData)

        // Find and set the selected act if act_id exists
        if (data.act_id && actOptions.length > 0) {
          const act = actOptions.find(a => a.id === data.act_id)
          setSelectedAct(act || null)
        }
      } else {
        setFormData(initialFormData)
        setSelectedAct(null)
      }
      setErrors({})
    }
  }, [open, data, actOptions])

  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Text field change handler
  const handleTextChange = (field: keyof ComplianceFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value })

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Select field change handler
  const handleSelectChange = (field: keyof ComplianceFormData) => (e: ChangeEvent<{ value: unknown }>) => {
    setFormData({ ...formData, [field]: e.target.value as string })

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Handle act selection
  const handleActChange = (event: any, newValue: ActOption | null) => {
    setSelectedAct(newValue)
    setFormData({
      ...formData,
      act_id: newValue?.id || null
    })

    // Clear error for act_id if it exists
    if (errors.act_id) {
      setErrors({ ...errors, act_id: '' })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.description) {
      newErrors.description = 'Description is required'
    }

    if (!formData.act_id) {
      newErrors.act_id = 'Act selection is required'
    }

    if (!formData.criticality) {
      newErrors.criticality = 'Criticality is required'
    }

    if (!formData.periodicity) {
      newErrors.periodicity = 'Periodicity is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)

      // Prepare data for API according to DTO
      const apiData = {
        edit: data?.id ? '1' : '0',
        description: formData.description,
        app_geog: formData.app_geog,
        state: formData.state,
        location: formData.location,
        event: formData.event,
        event_periodicity: formData.event_periodicity,
        application: formData.application,
        exemption: formData.exemption,
        section: formData.section,
        sub_section: formData.sub_section,
        rule: formData.rule,
        sub_head: formData.sub_head,
        rule_name: formData.rule_name,
        criticality: formData.criticality,
        periodicity: formData.periodicity,
        applicable_online: formData.applicable_online,
        site: formData.site,
        act_id: formData.act_id,
        provision: formData.provision,
        due_date: formData.due_date,
        triggers: formData.triggers,
        department: formData.department,
        agency: formData.agency,
        agency_add: formData.agency_add,
        form_name: formData.form_name,
        form_purpose: formData.form_purpose,
        potential_impact: formData.potential_impact,
        remarks: formData.remarks,
        key1: formData.key1,
        status: formData.status,
        timestampp: new Date().toISOString(),
        expiry_date: formData.expiry_date,
        legal_date: formData.legal_date,
        wef_date: formData.wef_date,
        wef_status: formData.wef_status
      }

      // If editing, include the ID
      if (data?.id) {
        apiData['id'] = data.id
      }

      // Endpoint based on whether it's an edit or add operation
      const endpoint = data?.id
        ? 'https://ai.lexcomply.co/v2/api/complianceMaster/updateCompliance'
        : 'https://ai.lexcomply.co/v2/api/complianceMaster/createCompliance'

      console.log('Sending data to API:', apiData)

      const response = await axiosInstance.post(endpoint, apiData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('API response:', response.data)

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: data?.id ? 'Compliance updated successfully!' : 'Compliance added successfully!',
          severity: 'success'
        })

        // Close dialog and trigger success callback after a delay
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error:', error)
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
        maxWidth='lg'
        fullWidth
        scroll='body'
        onClose={() => !loading && setOpen(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          {data?.id ? 'Edit Compliance' : 'Add New Compliance'}
          <Typography component='span' className='flex flex-col text-center'>
            {data?.id ? 'Update compliance details' : 'Add new compliance requirements'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
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
              {/* Act Selection - Fetched from API */}
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  fullWidth
                  options={actOptions}
                  loading={loadingActs}
                  value={selectedAct}
                  onChange={handleActChange}
                  id='compliance-act-select'
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      required
                      label='Select Act'
                      name='act_id'
                      placeholder='Select Act'
                      error={!!errors.act_id}
                      helperText={errors.act_id}
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

              {/* Description */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Description'
                  name='description'
                  required
                  placeholder='Enter compliance description'
                  value={formData.description}
                  onChange={handleTextChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                  disabled={loading}
                />
              </Grid>

              {/* Criticality and Periodicity */}
              <Grid item xs={12} md={4}>
                <CustomTextField
                  select
                  fullWidth
                  label='Criticality'
                  name='criticality'
                  required
                  value={formData.criticality}
                  onChange={handleSelectChange('criticality')}
                  error={!!errors.criticality}
                  helperText={errors.criticality}
                  disabled={loading}
                >
                  {criticalities.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  select
                  fullWidth
                  label='Periodicity'
                  name='periodicity'
                  required
                  value={formData.periodicity}
                  onChange={handleSelectChange('periodicity')}
                  error={!!errors.periodicity}
                  helperText={errors.periodicity}
                  disabled={loading}
                >
                  {periodicities.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  select
                  fullWidth
                  label='Applicable Online'
                  name='applicable_online'
                  value={formData.applicable_online}
                  onChange={handleSelectChange('applicable_online')}
                  disabled={loading}
                >
                  {applicableOnline.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              {/* Geographic Info */}
              <Grid item xs={12} md={4}>
                <CustomTextField
                  fullWidth
                  label='Application Geography'
                  name='app_geog'
                  placeholder='Enter geographical application'
                  value={formData.app_geog}
                  onChange={handleTextChange('app_geog')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  fullWidth
                  label='State'
                  name='state'
                  placeholder='Enter state'
                  value={formData.state}
                  onChange={handleTextChange('state')}
                  disabled={loading}
                  select
                >
                  {states.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  fullWidth
                  label='Location'
                  name='location'
                  placeholder='Enter specific location'
                  value={formData.location}
                  onChange={handleTextChange('location')}
                  disabled={loading}
                />
              </Grid>

              {/* Event Details */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Event'
                  name='event'
                  placeholder='Describe the triggering event'
                  value={formData.event}
                  onChange={handleTextChange('event')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Event Periodicity'
                  name='event_periodicity'
                  placeholder='Enter event periodicity'
                  value={formData.event_periodicity}
                  onChange={handleTextChange('event_periodicity')}
                  disabled={loading}
                />
              </Grid>

              {/* Application and Exemption */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Application'
                  name='application'
                  placeholder='Describe who this applies to'
                  value={formData.application}
                  onChange={handleTextChange('application')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Exemption'
                  name='exemption'
                  placeholder='Describe any exemptions'
                  value={formData.exemption}
                  onChange={handleTextChange('exemption')}
                  disabled={loading}
                />
              </Grid>

              {/* Rules and Sections */}
              <Grid item xs={12} md={3}>
                <CustomTextField
                  fullWidth
                  label='Section'
                  name='section'
                  placeholder='Enter section'
                  value={formData.section}
                  onChange={handleTextChange('section')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <CustomTextField
                  fullWidth
                  label='Sub-Section'
                  name='sub_section'
                  placeholder='Enter sub-section'
                  value={formData.sub_section}
                  onChange={handleTextChange('sub_section')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <CustomTextField
                  fullWidth
                  label='Rule'
                  name='rule'
                  placeholder='Enter rule'
                  value={formData.rule}
                  onChange={handleTextChange('rule')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <CustomTextField
                  fullWidth
                  label='Rule Name'
                  name='rule_name'
                  placeholder='Enter rule name'
                  value={formData.rule_name}
                  onChange={handleTextChange('rule_name')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Sub Head'
                  name='sub_head'
                  placeholder='Enter sub heading'
                  value={formData.sub_head}
                  onChange={handleTextChange('sub_head')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Site'
                  name='site'
                  placeholder='Enter website or site information'
                  value={formData.site}
                  onChange={handleTextChange('site')}
                  disabled={loading}
                />
              </Grid>

              {/* Provisions and Dates */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Provision'
                  name='provision'
                  placeholder='Describe penal provisions'
                  value={formData.provision}
                  onChange={handleTextChange('provision')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Due Date'
                  name='due_date'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  value={formData.due_date}
                  onChange={handleTextChange('due_date')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  fullWidth
                  label='Expiry Date'
                  name='expiry_date'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiry_date}
                  onChange={handleTextChange('expiry_date')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  fullWidth
                  label='Legal Date'
                  name='legal_date'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  value={formData.legal_date}
                  onChange={handleTextChange('legal_date')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <CustomTextField
                  fullWidth
                  label='WEF Date'
                  name='wef_date'
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  value={formData.wef_date}
                  onChange={handleTextChange('wef_date')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Triggers'
                  name='triggers'
                  placeholder='Enter days before due date to trigger notification'
                  value={formData.triggers}
                  onChange={handleTextChange('triggers')}
                  disabled={loading}
                />
              </Grid>

              {/* Department and Agency */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Department'
                  name='department'
                  placeholder='Enter department'
                  value={formData.department}
                  onChange={handleTextChange('department')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Agency'
                  name='agency'
                  placeholder='Enter statutory agency'
                  value={formData.agency}
                  onChange={handleTextChange('agency')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Agency Address'
                  name='agency_add'
                  placeholder='Enter agency address'
                  value={formData.agency_add}
                  onChange={handleTextChange('agency_add')}
                  disabled={loading}
                />
              </Grid>

              {/* Form information */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='Form Name'
                  name='form_name'
                  placeholder='Enter form name'
                  value={formData.form_name}
                  onChange={handleTextChange('form_name')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Form Purpose'
                  name='form_purpose'
                  placeholder='Describe form purpose'
                  value={formData.form_purpose}
                  onChange={handleTextChange('form_purpose')}
                  disabled={loading}
                />
              </Grid>

              {/* Impact and remarks */}
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Potential Impact'
                  name='potential_impact'
                  placeholder='Describe potential impact'
                  value={formData.potential_impact}
                  onChange={handleTextChange('potential_impact')}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Remarks'
                  name='remarks'
                  placeholder='Enter any additional remarks'
                  value={formData.remarks}
                  onChange={handleTextChange('remarks')}
                  disabled={loading}
                />
              </Grid>

              {/* Key definitions */}
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Key Definitions'
                  name='key1'
                  placeholder='Enter key definitions'
                  value={formData.key1}
                  onChange={handleTextChange('key1')}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : data?.id ? 'Update' : 'Submit'}
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
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AddCompliance
