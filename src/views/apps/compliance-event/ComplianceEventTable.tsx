'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CustomTextField from '@core/components/mui/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import axios from 'axios'
import https from 'https'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Type Imports
import type { ThemeColor } from '@core/types'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the structure of the API response
interface ComplianceEventData {
  id: number
  description: string
  department: string
  criticality: string
  periodicity: string
  sub_head: string
  application: string
  due_date: string
  act_id: string
  isDeleted: string
  status: number
  event?: string
  event_periodicity?: string
  app_geog?: string
  state?: string
  location?: string
  exemption?: string
  section?: string
  rule?: string
  triggers?: string
}

// Column helper for typed columns
const columnHelper = createColumnHelper<ComplianceEventData>()

// Define status color mapping
const statusObj: {
  [key: string]: { title: string; color: ThemeColor }
} = {
  High: { title: 'High', color: 'error' },
  Medium: { title: 'Medium', color: 'warning' },
  Low: { title: 'Low', color: 'success' },
  Monthly: { title: 'Monthly', color: 'primary' },
  Quarterly: { title: 'Quarterly', color: 'secondary' },
  'Half-Yearly': { title: 'Half-Yearly', color: 'info' },
  Yearly: { title: 'Yearly', color: 'warning' },
  'On Event': { title: 'On Event', color: 'error' }
}

const ComplianceEventTable = () => {
  // States
  const [eventId, setEventId] = useState<string>('')
  const [eventData, setEventData] = useState<ComplianceEventData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false)
  const [pageSize, setPageSize] = useState(10)

  // Function to fetch event data
  const fetchEventData = async () => {
    if (!eventId || eventId.trim() === '') {
      setError('Please enter a valid ID')
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching event data for ID: ${eventId}`)

      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/eventMaster/getComplianceEvent?id=${eventId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && response.data.data) {
        console.log('Event data received:', response.data.data)
        setEventData(response.data.data)
      } else {
        console.log('No event data found or invalid format')
        setError('No event data found for the provided ID')
        setEventData(null)
      }
    } catch (error) {
      console.error('Error fetching event data:', error)
      setError('Failed to load event data. Please try again later.')
      setEventData(null)
    } finally {
      setLoading(false)
    }
  }

  // Handle ID input change
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventId(e.target.value)
  }

  // Handle Enter key press in the ID input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchEventData()
    }
  }

  // Function to get status chip color
  const getStatusColor = (status: number): ThemeColor => {
    return status === 1 ? 'success' : 'error'
  }

  // Function to render status text
  const getStatusText = (status: number): string => {
    return status === 1 ? 'Active' : 'Inactive'
  }

  // Function to open details dialog for application text
  const openDetailsDialog = () => {
    setDetailsDialogOpen(true)
  }

  // Convert single event data to array for table
  const tableData = useMemo(() => (eventData ? [eventData] : []), [eventData])

  // Define columns for the table
  const columns = useMemo<ColumnDef<ComplianceEventData, any>[]>(
    () => [
      // ID Column
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>,
        size: 60
      }),

      // Description Column
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.description}>
            <Typography className='truncate' sx={{ maxWidth: '200px' }}>
              {row.original.description || 'N/A'}
            </Typography>
          </Tooltip>
        ),
        size: 200
      }),

      // Sub Head Column
      columnHelper.accessor('sub_head', {
        header: 'Sub Head',
        cell: ({ row }) => <Typography>{row.original.sub_head || 'N/A'}</Typography>,
        size: 120
      }),

      // Act ID Column
      columnHelper.accessor('act_id', {
        header: 'Act ID',
        cell: ({ row }) => <Typography>{row.original.act_id || 'N/A'}</Typography>,
        size: 80
      }),

      // Criticality Column
      columnHelper.accessor('criticality', {
        header: 'Criticality',
        cell: ({ row }) => {
          const criticality = row.original.criticality || 'Low'
          return (
            <Chip label={criticality} color={statusObj[criticality]?.color || 'default'} size='small' variant='tonal' />
          )
        },
        size: 100
      }),

      // Periodicity Column
      columnHelper.accessor('periodicity', {
        header: 'Periodicity',
        cell: ({ row }) => {
          const periodicity = row.original.periodicity || 'Monthly'
          return (
            <Chip label={periodicity} color={statusObj[periodicity]?.color || 'default'} size='small' variant='tonal' />
          )
        },
        size: 110
      }),

      // Department Column
      columnHelper.accessor('department', {
        header: 'Department',
        cell: ({ row }) => <Typography>{row.original.department || 'N/A'}</Typography>,
        size: 120
      }),

      // Due Date Column
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{row.original.due_date || 'N/A'}</Typography>,
        size: 110
      }),

      // Status Column
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={getStatusText(row.original.status)}
            color={getStatusColor(row.original.status)}
            size='small'
            variant='tonal'
          />
        ),
        size: 90
      }),

      // Application Column
      columnHelper.accessor('application', {
        header: 'Application',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <Tooltip title='View application details'>
              <Button size='small' onClick={openDetailsDialog}>
                View Details
              </Button>
            </Tooltip>
          </div>
        ),
        size: 120
      }),

      // Actions Column
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <div className='flex justify-center'>
            <OptionMenu
              iconButtonProps={{ size: 'small' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View Details',
                  icon: 'tabler-eye',
                  menuItemProps: { onClick: openDetailsDialog }
                },
                {
                  text: 'Export',
                  icon: 'tabler-download',
                  menuItemProps: { onClick: () => console.log('Export clicked') }
                }
              ]}
            />
          </div>
        ),
        size: 80
      })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination: {
        pageSize: pageSize,
        pageIndex: 0
      }
    }
  })

  return (
    <Card>
      <CardHeader
        title='Compliance Event Details'
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': { fontSize: '1.25rem' }
        }}
      />

      {/* Input area for ID */}
      <div className='flex items-center gap-4 px-6 py-4'>
        <CustomTextField
          label='Event ID'
          placeholder='Enter event ID'
          value={eventId}
          onChange={handleIdChange}
          onKeyDown={handleKeyDown}
          className='flex-grow'
          fullWidth
          InputProps={{
            endAdornment: eventId && (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => setEventId('')}>
                  <i className='tabler-x' />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button variant='contained' onClick={fetchEventData} disabled={loading || !eventId.trim()}>
          {loading ? <CircularProgress size={24} /> : 'Fetch'}
        </Button>
      </div>

      <Divider />

      {/* Search & Options Area */}
      <div className='flex justify-between items-center px-6 py-3'>
        <div>{eventData && <Typography variant='body2'>Showing details for Event ID: {eventData.id}</Typography>}</div>

        <div className='flex items-center gap-4'>
          <CustomTextField
            select
            value={pageSize}
            onChange={e => {
              const size = Number(e.target.value)
              setPageSize(size)
              table.setPageSize(size)
            }}
            className='is-[80px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>
        </div>
      </div>

      <Divider />

      {/* Show error message if there's an error */}
      {error && (
        <Alert severity='error' sx={{ mx: 6, my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Show loading indicator while fetching data */}
      {loading && (
        <div className='flex justify-center py-8'>
          <CircularProgress size={40} />
        </div>
      )}

      {/* Show message when no data is available */}
      {!loading && !eventData && !error && (
        <div className='text-center py-8 text-textSecondary'>
          Enter an event ID and click "Fetch" to view event details.
        </div>
      )}

      {/* Display event data in table format when available */}
      {!loading && eventData && (
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog for showing full application text */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{eventData?.application || 'No details available'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ComplianceEventTable
