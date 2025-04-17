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
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'

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

// Define type for event data with affected acts
type AffectedActsType = {
  id: string
  eventName: string
  eventDate: string
  startTime: string
  endTime: string
  affectedActs: string[] // Array of act names affected by this event
}

// Column Definitions
const columnHelper = createColumnHelper<AffectedActsType>()

const AffectedActs = () => {
  // States for data
  const [data, setData] = useState<AffectedActsType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // States for table
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  // Fetch events data on component mount
  useEffect(() => {
    fetchAffectedActs()
  }, [])

  // Function to fetch events with affected acts
  const fetchAffectedActs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // This would be your actual API endpoint
      // const response = await axiosInstance.get('/events/getAffectedActs')

      // For now, using mock data
      const mockData: AffectedActsType[] = [
        {
          id: '1',
          eventName: 'Finance Act Amendment',
          eventDate: '2025-05-15',
          startTime: '09:00',
          endTime: '17:00',
          affectedActs: ['Finance Act 2021', 'Banking Regulation Act', 'Companies Act']
        },
        {
          id: '2',
          eventName: 'Data Protection Law Implementation',
          eventDate: '2025-06-10',
          startTime: '00:00',
          endTime: '23:59',
          affectedActs: ['Data Protection Act', 'IT Act', 'Consumer Protection Act']
        },
        {
          id: '3',
          eventName: 'Environmental Compliance Update',
          eventDate: '2025-04-05',
          startTime: '10:00',
          endTime: '16:30',
          affectedActs: ['Environmental Protection Act', 'Industrial Waste Management Act']
        },
        {
          id: '4',
          eventName: 'Labor Law Reform',
          eventDate: '2025-05-22',
          startTime: '11:00',
          endTime: '13:00',
          affectedActs: ['Labor Act', 'Industrial Disputes Act', 'Factories Act', 'Minimum Wages Act']
        },
        {
          id: '5',
          eventName: 'Healthcare Compliance Changes',
          eventDate: '2025-04-18',
          startTime: '09:30',
          endTime: '11:30',
          affectedActs: ['Healthcare Act', 'Medical Devices Regulation', 'Pharmaceuticals Act']
        }
      ]

      setData(mockData)
    } catch (err) {
      console.error('Error fetching affected acts:', err)
      setError('Failed to load affected acts data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle export all data
  const handleExportAll = () => {
    console.log('Exporting affected acts data:', data)

    // Here you would implement the actual export logic
    // Example CSV export:
    let csvContent = 'Sr. No.,Event,Affected Acts\n'

    data.forEach((item, index) => {
      csvContent += `${index + 1},"${item.eventName}","${item.affectedActs.join('; ')}"\n`
    })

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'affected_acts.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Define columns - EXACTLY THREE AS REQUESTED
  const columns = useMemo<ColumnDef<AffectedActsType, any>[]>(
    () => [
      // Sr. No. column
      columnHelper.accessor(row => row, {
        id: 'srNo',
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 80
      }),

      // Event column
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
        size: 300
      }),

      // Affected Acts column
      columnHelper.accessor('affectedActs', {
        header: 'Affected Acts',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            {row.original.affectedActs.map((act, index) => (
              <Chip key={index} label={act} size='small' variant='outlined' color='primary' sx={{ mb: 0.5 }} />
            ))}
          </div>
        ),
        size: 400
      })
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

  return (
    <Card>
      <CardHeader
        title='Affected Acts'
        action={
          <Button
            color='primary'
            variant='outlined'
            onClick={handleExportAll}
            startIcon={<i className='tabler-file-export' />}
            disabled={data.length === 0}
          >
            Export All
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

      {/* Search area */}
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <CustomTextField
          placeholder='Search acts...'
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center py-10'>
                    {loading ? 'Loading data...' : 'No affected acts found'}
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
    </Card>
  )
}

export default AffectedActs
