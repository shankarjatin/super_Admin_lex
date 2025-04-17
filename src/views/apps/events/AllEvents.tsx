'use client'

// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import AddEventDialog from '@/components/dialogs/add-event'

// Third-party Imports
import axios from 'axios'
import https from 'https'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnFiltersState
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Create axios instance for API calls
const axiosInstance = axios.create({
  baseURL: 'https://ai.lexcomply.co/v2/api',
  timeout: 10000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define type for event data
type EventDataType = {
  id: string
  eventName: string
  eventType: string
  eventDate: string
  startTime: string
  endTime: string
  location: string
  organizer: string
  description: string
  attendees: number
  status: string
}

// Column Definitions
const columnHelper = createColumnHelper<EventDataType>()

const AllEvents = () => {
  // States for data
  const [data, setData] = useState<EventDataType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // States for table
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  // States for dialogs
  const [addEventDialogOpen, setAddEventDialogOpen] = useState<boolean>(false)
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventDataType | null>(null)

  // Fetch events data on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Function to fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // This would be your actual API endpoint
      // const response = await axiosInstance.get('/events/getAllEvents')

      // For now, using mock data
      // In a real implementation, this would come from your API
      const mockEvents: EventDataType[] = [
        {
          id: '1',
          eventName: 'Annual Compliance Training',
          eventType: 'Training',
          eventDate: '2025-05-15',
          startTime: '09:00',
          endTime: '17:00',
          location: 'Conference Room A',
          organizer: 'HR Department',
          description: 'Annual mandatory training session on compliance procedures.',
          attendees: 45,
          status: 'Upcoming'
        },
        {
          id: '2',
          eventName: 'Regulatory Update Seminar',
          eventType: 'Seminar',
          eventDate: '2025-06-10',
          startTime: '10:00',
          endTime: '12:00',
          location: 'Virtual Meeting',
          organizer: 'Legal Department',
          description: 'Updates on recent regulatory changes affecting our industry.',
          attendees: 120,
          status: 'Upcoming'
        },
        {
          id: '3',
          eventName: 'Data Privacy Workshop',
          eventType: 'Workshop',
          eventDate: '2025-04-05',
          startTime: '14:00',
          endTime: '16:30',
          location: 'Training Room B',
          organizer: 'IT Security Team',
          description: 'Hands-on workshop on data privacy protocols and best practices.',
          attendees: 30,
          status: 'Completed'
        },
        {
          id: '4',
          eventName: 'Crisis Management Drill',
          eventType: 'Drill',
          eventDate: '2025-05-22',
          startTime: '11:00',
          endTime: '13:00',
          location: 'Main Office',
          organizer: 'Risk Management',
          description: 'Simulated crisis scenario to test response protocols.',
          attendees: 25,
          status: 'Upcoming'
        },
        {
          id: '5',
          eventName: 'Vendor Compliance Review',
          eventType: 'Meeting',
          eventDate: '2025-04-18',
          startTime: '09:30',
          endTime: '11:30',
          location: 'Meeting Room C',
          organizer: 'Procurement Team',
          description: 'Quarterly review of vendor compliance with our standards.',
          attendees: 15,
          status: 'Cancelled'
        }
      ]

      setData(mockEvents)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle event edit
  const handleEdit = (event: EventDataType) => {
    setSelectedEventForEdit(event)
    setAddEventDialogOpen(true)
  }

  // Handle event deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      setLoading(true)

      // This would be your actual API endpoint
      // await axiosInstance.delete(`/events/deleteEvent/${id}`)

      // For now, just filtering the data in the state
      setData(prevData => prevData.filter(event => event.id !== id))

      alert('Event deleted successfully')
    } catch (err) {
      console.error('Error deleting event:', err)
      alert('Failed to delete event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle export all events
  const handleExportAll = () => {
    // Implement export functionality here
    console.log('Exporting all events data:', data)
    alert('Export functionality would be implemented here')
  }

  // Define columns - SIMPLIFIED TO ONLY TWO COLUMNS
  const columns = useMemo<ColumnDef<EventDataType, any>[]>(
    () => [
      // Sr. No. column
      columnHelper.accessor(row => row, {
        id: 'srNo',
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 100
      }),

      // Event Name column
      columnHelper.accessor('eventName', {
        header: 'Event',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography className='font-medium'>{row.original.eventName}</Typography>
            <Typography variant='body2' className='text-textSecondary'>
              {row.original.eventDate} | {row.original.startTime} - {row.original.endTime}
            </Typography>
          </div>
        ),
        size: 400
      })

      // Hidden Actions column (for functionality, not displayed in header)
      //   columnHelper.accessor(row => row, {
      //     id: 'actions',
      //     header: '',
      //     cell: ({ row }) => (
      //       <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      //         <IconButton size='small' color='primary' onClick={() => handleEdit(row.original)}>
      //           <i className='tabler-edit' />
      //         </IconButton>
      //         <IconButton size='small' color='error' onClick={() => handleDelete(row.original.id)}>
      //           <i className='tabler-trash' />
      //         </IconButton>
      //       </Box>
      //     ),
      //     size: 100
      //   })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      columnFilters,
      pagination: {
        pageSize,
        pageIndex
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // Handle successful addition or update
  const handleSuccess = () => {
    fetchEvents()
  }

  return (
    <Card>
      <CardHeader
        title='All Events'
        action={
          <Button
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => {
              setSelectedEventForEdit(null)
              setAddEventDialogOpen(true)
            }}
          >
            Add Event
          </Button>
        }
      />

      <Divider />

      {/* Error message */}
      {error && (
        <Alert severity='error' sx={{ mx: 3, my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and export area */}
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <CustomTextField
          placeholder='Search events...'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className='max-sm:is-full'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='tabler-search' />
              </InputAdornment>
            ),
            endAdornment: globalFilter && (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  onClick={() => setGlobalFilter('')}
                  sx={{ borderRadius: 1, color: 'text.disabled' }}
                >
                  <i className='tabler-x text-lg' />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <div className='flex items-center gap-4'>
          <Button
            color='primary'
            variant='outlined'
            onClick={handleExportAll}
            startIcon={<i className='tabler-file-export' />}
            disabled={data.length === 0}
          >
            Export All
          </Button>
        </div>
      </div>

      <Divider />

      {/* Table section */}
      <div className='relative w-full'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-background/50 z-10'>
            <CircularProgress />
          </div>
        )}

        <div className='overflow-x-auto w-full'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className={header.id === 'actions' ? 'w-[100px]' : ''}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {/* Hide the "Actions" header text but keep functionality */}
                          {header.id !== 'actions' && flexRender(header.column.columnDef.header, header.getContext())}

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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center py-10'>
                    {loading ? 'Loading events...' : 'No events found'}
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ borderTop: '1px solid rgba(58, 53, 65, 0.12)', width: '100%' }}>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={(_, page) => {
            setPageIndex(page)
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            const size = parseInt(e.target.value, 10)
            setPageSize(size)
            table.setPageSize(size)
            setPageIndex(0)
            table.setPageIndex(0)
          }}
        />
      </div>

      {/* Add Event Dialog placeholder - you would need to implement this component */}
      {
        <AddEventDialog
          open={addEventDialogOpen}
          setOpen={setAddEventDialogOpen}
          data={selectedEventForEdit}
          onSuccess={handleSuccess}
        />
      }
    </Card>
  )
}

export default AllEvents
