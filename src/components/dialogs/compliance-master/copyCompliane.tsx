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
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Third-party Imports
import axios from 'axios'
import https from 'https'

type CopyComplianceProps = {
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

// Interface matching the DTO
interface CopyComplianceFormData {
  id: number | null
  send_mail: string
  copy_archieve: string
  description: string
  app_geog: string
  state: string
  event: string
  event_periodicity: string
  application: string
  exemption: string
  section: string
  sub_section: string
  rule: string
  rule_name: string
  sub_head: string
  criticality: string
  periodicity: string
  applicable_online: boolean
  site: string
  due_date: string
  triggers: string
  provision: string
  agency: string
  agency_add: string
  remarks: string
  key1: string
  status: string
  form_name: string
  form_purpose: string
  potential_impact: string
  act_id: number | null
  recode: string
}

// Initial form state
const initialFormData: CopyComplianceFormData = {
  id: null,
  send_mail: 'no',
  copy_archieve: 'no',
  description: '',
  app_geog: '',
  state: '',
  event: '',
  event_periodicity: '',
  application: '',
  exemption: '',
  section: '',
  sub_section: '',
  rule: '',
  rule_name: '',
  sub_head: '',
  criticality: 'Medium',
  periodicity: 'Monthly',
  applicable_online: false,
  site: '',
  due_date: '',
  triggers: '',
  provision: '',
  agency: '',
  agency_add: '',
  remarks: '',
  key1: '',
  status: '1',
  form_name: '',
  form_purpose: '',
  potential_impact: '',
  act_id: null,
  recode: ''
}

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `compliance-tab-${index}`,
    'aria-controls': `compliance-tabpanel-${index}`
  }
}

const CopyCompliance = ({ open, setOpen, onSuccess }: CopyComplianceProps) => {
  // States
  const [sourceId, setSourceId] = useState<string>('')
  const [formData, setFormData] = useState<CopyComplianceFormData>(initialFormData)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Function to handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  // Reset form when dialog closes
  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      setSourceId('')
      setFormData(initialFormData)
      setTabValue(0)
    }
  }

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle switch changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceId) {
      setSnackbar({
        open: true,
        message: 'Please enter a source compliance ID',
        severity: 'error'
      })
      return
    }

    setLoading(true)

    try {
      // Create submission data including the sourceId
      const submissionData = {
        ...formData,
        id: Number(sourceId)
      }

      // Call API
      const response = await axiosInstance.post(
        'https://ai.lexcomply.co/v2/api/complianceMaster/copyCompliance',
        submissionData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Compliance copied successfully!',
          severity: 'success'
        })

        // Close dialog and trigger success callback
        setTimeout(() => {
          setOpen(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Copy failed')
      }
    } catch (error) {
      console.error('Error copying compliance:', error)
      setSnackbar({
        open: true,
        message: `Failed to copy compliance: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        onClose={handleClose}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
          Copy Compliance
          <Typography component='span' className='flex flex-col text-center'>
            Copy compliance with customized settings
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className='pbs-0 sm:pli-16'>
            <DialogCloseButton onClick={handleClose} disableRipple disabled={loading}>
              <i className='tabler-x' />
            </DialogCloseButton>

            {/* Source ID field - always visible */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Source Compliance ID'
                  name='sourceId'
                  required
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>#</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>

            {/* Options tabs for organizing many fields */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label='compliance copy options tabs'
                  variant='scrollable'
                >
                  <Tab label='Basic Info' {...a11yProps(0)} />
                  <Tab label='Details' {...a11yProps(1)} />
                  <Tab label='Rules & Sections' {...a11yProps(2)} />
                  <Tab label='Agency & Form' {...a11yProps(3)} />
                  <Tab label='Additional Info' {...a11yProps(4)} />
                </Tabs>
              </Box>

              {/* Basic Info Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Description'
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Geographic Application'
                      name='app_geog'
                      value={formData.app_geog}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      select
                      fullWidth
                      label='State'
                      name='state'
                      value={formData.state}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value=''>Select State</MenuItem>
                      <MenuItem value='Maharashtra'>Maharashtra</MenuItem>
                      <MenuItem value='Delhi'>Delhi</MenuItem>
                      <MenuItem value='Karnataka'>Karnataka</MenuItem>
                      <MenuItem value='Tamil Nadu'>Tamil Nadu</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Criticality'
                      name='criticality'
                      value={formData.criticality}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value='High'>High</MenuItem>
                      <MenuItem value='Medium'>Medium</MenuItem>
                      <MenuItem value='Low'>Low</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Periodicity'
                      name='periodicity'
                      value={formData.periodicity}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value='Monthly'>Monthly</MenuItem>
                      <MenuItem value='Quarterly'>Quarterly</MenuItem>
                      <MenuItem value='Half-Yearly'>Half-Yearly</MenuItem>
                      <MenuItem value='Yearly'>Yearly</MenuItem>
                      <MenuItem value='One Time'>One Time</MenuItem>
                      <MenuItem value='On Event'>On Event</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      type='date'
                      label='Due Date'
                      name='due_date'
                      value={formData.due_date}
                      onChange={handleChange}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.applicable_online}
                          onChange={handleSwitchChange}
                          name='applicable_online'
                          disabled={loading}
                        />
                      }
                      label='Applicable Online'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Send Mail'
                      name='send_mail'
                      value={formData.send_mail}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value='yes'>Yes</MenuItem>
                      <MenuItem value='no'>No</MenuItem>
                    </CustomTextField>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Details Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Event'
                      name='event'
                      value={formData.event}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Event Periodicity'
                      name='event_periodicity'
                      value={formData.event_periodicity}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Application'
                      name='application'
                      value={formData.application}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Exemption'
                      name='exemption'
                      value={formData.exemption}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Website'
                      name='site'
                      value={formData.site}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Triggers'
                      name='triggers'
                      value={formData.triggers}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Provision'
                      name='provision'
                      multiline
                      rows={2}
                      value={formData.provision}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Copy Archive'
                      name='copy_archieve'
                      value={formData.copy_archieve}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value='yes'>Yes</MenuItem>
                      <MenuItem value='no'>No</MenuItem>
                    </CustomTextField>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Rules & Sections Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Section'
                      name='section'
                      value={formData.section}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Sub Section'
                      name='sub_section'
                      value={formData.sub_section}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Rule'
                      name='rule'
                      value={formData.rule}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Rule Name'
                      name='rule_name'
                      value={formData.rule_name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Sub Head'
                      name='sub_head'
                      value={formData.sub_head}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Act ID'
                      name='act_id'
                      type='number'
                      value={formData.act_id || ''}
                      onChange={e =>
                        setFormData({ ...formData, act_id: e.target.value ? Number(e.target.value) : null })
                      }
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Agency & Form Tab */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Agency'
                      name='agency'
                      value={formData.agency}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Agency Address'
                      name='agency_add'
                      value={formData.agency_add}
                      onChange={handleChange}
                      disabled={loading}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Form Name'
                      name='form_name'
                      value={formData.form_name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Form Purpose'
                      name='form_purpose'
                      value={formData.form_purpose}
                      onChange={handleChange}
                      disabled={loading}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Additional Info Tab */}
              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Remarks'
                      name='remarks'
                      value={formData.remarks}
                      onChange={handleChange}
                      disabled={loading}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Potential Impact'
                      name='potential_impact'
                      value={formData.potential_impact}
                      onChange={handleChange}
                      disabled={loading}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Key'
                      name='key1'
                      value={formData.key1}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      select
                      label='Status'
                      name='status'
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value='1'>Active</MenuItem>
                      <MenuItem value='0'>Inactive</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      fullWidth
                      label='Record'
                      name='recode'
                      value={formData.recode}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          </DialogContent>

          <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Copy Compliance'}
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

export default CopyCompliance
