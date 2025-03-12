import React, { useState } from 'react'
import {
  Typography,
  Grid,
  Box,
  Paper,
  IconButton,
  CardHeader,
  Tooltip,
  Card,
  CardActions,
  CardContent
} from '@mui/material'
import { color, styled } from '@mui/system'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const DataItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: '8px 0',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflow: 'hidden',
  className: ''
}))

const FullDetails = styled(Typography)(({ theme }) => ({
  wordWrap: 'break-word',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
  fontSize: '1.1rem' // Increased font size for better readability
}))

const FormDataDisplay: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedText(text) // Update state to show 'Copied' message
        setTimeout(() => setCopiedText(null), 2000) // Reset after 2 seconds
      },
      () => {
        alert('Failed to copy!')
      }
    )
  }

  return (
    <Card sx={{ flexGrow: 1 }}>
      <CardHeader title='Javascript file to be pasted' />
      <CardContent className=''>
        <Grid container spacing={2}>
          {/* Step 1: Copy the following files */}
          <Grid item xs={12} sm={12} md={12}>
            <div className='flex items-center space-x-2  mb-4 '>
              <code className='w-full bg-gray-500'>
                <pre
                  className='m-0 p-2 flex-1 bg-gray-500 text-gray-100 rounded-md text-md overflow-auto'
                  style={{
                    marginTop: '0px',
                    marginBottom: '0px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {`<script src="https://example.com/your-script.js"></script>`}
                </pre>
              </code>
              <Tooltip title='Copy'>
                <IconButton onClick={() => handleCopy('<script src="https://example.com/your-script.js"></script>')}>
                  {copiedText === '<script src="https://example.com/your-script.js"></script>' ? (
                    <CheckCircleIcon />
                  ) : (
                    <FileCopyIcon />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FormDataDisplay
