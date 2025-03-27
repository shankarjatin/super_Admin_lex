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
import Avatar from '@mui/material/Avatar'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import FileUploaderRestrictions from '@/views/forms/form-elements/file-uploader/FileUploaderRestrictions'

type AdminData = {
  name?: string
  email?: string
  contact?: string
  profileImage?: string
}

type AddAdminProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: AdminData
}

const initialAdminData: AdminData = {
  name: '',
  email: '',
  contact: '',
  profileImage: ''
}

const AddAdmin = ({ open, setOpen, data }: AddAdminProps) => {
  // States
  const [adminData, setAdminData] = useState<AdminData>(initialAdminData)
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    setAdminData(data ?? initialAdminData)
  }, [open, data])

  const handleImageUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles)

    // Create a preview URL for the uploaded image
    if (uploadedFiles.length > 0) {
      const imageUrl = URL.createObjectURL(uploadedFiles[0])
      setAdminData({ ...adminData, profileImage: imageUrl })
    }
  }

  const handleSubmit = () => {
    // Form validation
    if (!adminData.name?.trim()) {
      alert('Please enter admin name')
      return
    }

    if (!adminData.email?.trim()) {
      alert('Please enter email address')
      return
    }

    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(adminData.email)) {
      alert('Please enter a valid email address')
      return
    }

    if (!adminData.contact?.trim()) {
      alert('Please enter contact number')
      return
    }

    console.log('Submitting admin data:', adminData)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={() => setOpen(false)}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-12 sm:pbe-6 sm:pli-12'>
        {data ? 'Edit Admin' : 'Add New Admin'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Update admin information' : 'Add new administrator to the system'}
        </Typography>
      </DialogTitle>
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
          <Grid container spacing={6}>
            <Grid item xs={12} className='flex flex-col items-center'>
              {/* <div className='mb-6'>
                {adminData.profileImage ? (
                  <Avatar src={adminData.profileImage} alt='Admin Profile' sx={{ width: 100, height: 100 }} />
                ) : (
                  <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                    {adminData.name?.charAt(0) || 'A'}
                  </Avatar>
                )}
              </div> */}
              <FileUploaderRestrictions
                setFiles={handleImageUpload}
                name='profile-image'
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }}
                maxSize={2000000}
                maxFiles={1}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Admin Name'
                name='name'
                required
                placeholder='Enter Full Name'
                value={adminData?.name}
                onChange={e => setAdminData({ ...adminData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Email Address'
                name='email'
                required
                type='email'
                placeholder='admin@example.com'
                value={adminData?.email}
                onChange={e => setAdminData({ ...adminData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Contact Number'
                name='contact'
                required
                placeholder='(123) 456-7890'
                value={adminData?.contact}
                onChange={e => setAdminData({ ...adminData, contact: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={handleSubmit} type='submit'>
            {data ? 'Update' : 'Submit'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => setOpen(false)} type='reset'>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddAdmin
