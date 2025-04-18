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
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define types for act data
interface ActTypeData {
  id: number
  name: string
  industry_type: string
}

// Interface for industry type state
interface IndustryTypeState {
  service: boolean
  manufacturing: boolean
  trading: boolean
}

// Props interface
interface EditIndustryTypeProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedAct: ActTypeData | null
  onSuccess?: (updatedAct: ActTypeData) => void
}

const EditIndustryType = ({ open, setOpen, selectedAct, onSuccess }: EditIndustryTypeProps) => {
  // States
  const [industryTypeState, setIndustryTypeState] = useState<IndustryTypeState>({
    service: false,
    manufacturing: false,
    trading: false
  })
  const [editLoading, setEditLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Parse industry type string to checkbox state
  const parseIndustryType = (type: string): IndustryTypeState => {
    return {
      service: type.includes('S'),
      manufacturing: type.includes('M'),
      trading: type.includes('T')
    }
  }

  // Convert checkbox state to industry type string
  const convertToIndustryType = (state: IndustryTypeState): string => {
    let result = ''
    if (state.service) result += 'S'
    if (state.manufacturing) result += 'M'
    if (state.trading) result += 'T'
    return result
  }

  // Format industry type for better display
  const formatIndustryType = (type: string) => {
    if (!type) return 'N/A'

    const types = {
      S: 'Service',
      M: 'Manufacturing',
      T: 'Trading',
      SMT: 'Service, Manufacturing & Trading',
      SM: 'Service & Manufacturing',
      ST: 'Service & Trading',
      MT: 'Manufacturing & Trading'
    }

    return types[type as keyof typeof types] || type
  }

  // Reset state when dialog opens with new selectedAct
  useEffect(() => {
    if (selectedAct) {
      setIndustryTypeState(parseIndustryType(selectedAct.industry_type))
    }
  }, [selectedAct, open])

  // Handle checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndustryTypeState({
      ...industryTypeState,
      [event.target.name]: event.target.checked
    })
  }

  // Handle save button click
  const handleSave = async () => {
    if (!selectedAct) return

    const newIndustryType = convertToIndustryType(industryTypeState)

    // Don't proceed if nothing changed
    if (newIndustryType === selectedAct.industry_type) {
      setOpen(false)
      return
    }

    setEditLoading(true)

    try {
      const response = await axiosInstance.post('https://ai.lexcomply.co/v2/api/actMaster/updateIndustryTypeAct', {
        actId: selectedAct.id,
        industry_type: newIndustryType
      })

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Industry type updated successfully!',
          severity: 'success'
        })

        // Call onSuccess callback with updated act data
        if (onSuccess) {
          onSuccess({
            ...selectedAct,
            industry_type: newIndustryType
          })
        }

        // Close dialog after delay to show success message
        setTimeout(() => {
          setOpen(false)
        }, 1500)
      } else {
        throw new Error(response.data?.message || 'Failed to update industry type')
      }
    } catch (error) {
      console.error('Error updating industry type:', error)
      setSnackbar({
        open: true,
        message: `Failed to update industry type: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      })
    } finally {
      setEditLoading(false)
    }
  }

  // Handle close dialog
  const handleClose = () => {
    if (!editLoading) {
      setOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth aria-labelledby='edit-industry-type-dialog'>
        <DialogTitle id='edit-industry-type-dialog'>
          Edit Industry Type
          <DialogCloseButton onClick={handleClose} disabled={editLoading} />
        </DialogTitle>

        <DialogContent>
          {selectedAct && (
            <Box sx={{ mb: 4, mt: 2 }}>
              <Typography variant='subtitle1' fontWeight={600}>
                Act ID: {selectedAct.id}
              </Typography>
              <Typography variant='body1' sx={{ mt: 1, mb: 2 }}>
                {selectedAct.name}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant='subtitle2' sx={{ mb: 2 }}>
                Select applicable industry types:
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={industryTypeState.service}
                      onChange={handleCheckboxChange}
                      name='service'
                      disabled={editLoading}
                    />
                  }
                  label='Service'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={industryTypeState.manufacturing}
                      onChange={handleCheckboxChange}
                      name='manufacturing'
                      disabled={editLoading}
                    />
                  }
                  label='Manufacturing'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={industryTypeState.trading}
                      onChange={handleCheckboxChange}
                      name='trading'
                      disabled={editLoading}
                    />
                  }
                  label='Trading'
                />
              </FormGroup>

              {convertToIndustryType(industryTypeState) === '' && (
                <Alert severity='warning' sx={{ mt: 2 }}>
                  Please select at least one industry type
                </Alert>
              )}

              <Typography variant='body2' color='textSecondary' sx={{ mt: 3 }}>
                Current setting: {formatIndustryType(selectedAct.industry_type)}
              </Typography>

              {convertToIndustryType(industryTypeState) !== selectedAct.industry_type && (
                <Typography variant='body2' color='primary' sx={{ mt: 1 }}>
                  New setting will be: {formatIndustryType(convertToIndustryType(industryTypeState))}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={editLoading || convertToIndustryType(industryTypeState) === ''}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
          <Button variant='outlined' onClick={handleClose} disabled={editLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default EditIndustryType
