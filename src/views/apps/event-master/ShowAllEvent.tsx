'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CustomTextField from '@core/components/mui/TextField'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import https from 'https'

// Component Imports
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for event data
type EventDataType = {
  id: string
  event_name: string
  description?: string
}

// Column Definitions
const columnHelper = createColumnHelper<EventDataType>()

const ShowAllEvent = () => {
  // States
  const [data, setData] = useState<EventDataType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [pageSize, setPageSize] = useState(10)

  // Fetch events data when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/eventMaster/getEventCompliance')

        if (response.data.data) {
          console.log('Event data:', response.data.data)
          setData(response.data.data)
        } else {
          setError('No data received from server')
        }
      } catch (error) {
        console.error('Error fetching event data:', error)
        setError('Failed to fetch event data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Define columns for the table
  const columns = useMemo<ColumnDef<EventDataType, any>[]>(
    () => [
      // Serial Number Column
      columnHelper.accessor('id', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 80
      }),

      // Event Name Column
      columnHelper.accessor('event_name', {
        header: 'Event',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' fontWeight={500}>
              {row.original.event || 'N/A'}
            </Typography>
          </div>
        )
      })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination: {
        pageSize,
        pageIndex: 0
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader
        title='Event List'
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': { fontSize: '1.25rem' }
        }}
      />

      {/* Search Area */}
      <div className='flex justify-between items-center px-6 py-3'>
        <CustomTextField
          placeholder='Search events...'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='tabler-search text-xl' />
              </InputAdornment>
            ),
            endAdornment: globalFilter && (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => setGlobalFilter('')}>
                  <i className='tabler-x' />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <CustomTextField
          select
          value={pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
            setPageSize(Number(e.target.value))
          }}
          className='is-[80px]'
        >
          <MenuItem value='10'>10</MenuItem>
          <MenuItem value='25'>25</MenuItem>
          <MenuItem value='50'>50</MenuItem>
          <MenuItem value='100'>100</MenuItem>
        </CustomTextField>
      </div>

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
      {!loading && data.length === 0 && !error && (
        <div className='text-center py-8 text-textSecondary'>No event data available.</div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
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

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            const size = parseInt(e.target.value, 10)
            setPageSize(size)
            table.setPageSize(size)
          }}
        />
      )}
    </Card>
  )
}

export default ShowAllEvent
