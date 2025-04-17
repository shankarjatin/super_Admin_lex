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
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

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
import AddActCategory from '@/components/dialogs/add-act-category'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define type for the act data
interface ActData {
  id: number
  act_id: string
  name: string
  types_1: string
  types_2: string
  types_3: string
  types_4: string
  status: number
  date: string
  isDeleted: string
}

// Column Definitions
const columnHelper = createColumnHelper<ActData>()

const ViewActsTable = () => {
  // States
  const [actsData, setActsData] = useState<ActData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [pageSize, setPageSize] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Dialog state - renamed from dialogOpen to addModalOpen for consistency with ActListTable pattern
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false)

  // Fetch acts data when component mounts
  useEffect(() => {
    fetchActsData()
  }, [])

  // Function to fetch acts data
  const fetchActsData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching acts data...')

      const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/getViewActs', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data && response.data.data && response.data.data.events) {
        console.log('Acts data loaded:', response.data.data.events.length, 'items')
        setActsData(response.data.data.events)
      } else {
        console.log('No acts data found or invalid format')
        setActsData([])
        setError('No acts data found or invalid format')
      }
    } catch (error) {
      console.error('Error fetching acts data:', error)
      setError('Failed to load acts data. Please try again later.')
      setActsData([])
    } finally {
      setLoading(false)
    }
  }

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchActsData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle successful act category creation
  const handleActSuccess = () => {
    // Refresh the acts data to show newly added categories
    fetchActsData()
  }

  // Define columns for the table
  const columns = useMemo<ColumnDef<ActData, any>[]>(
    () => [
      // Column definitions remain the same as before
      columnHelper.accessor('id', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 60
      }),

      columnHelper.accessor('act_id', {
        header: 'ID',
        cell: ({ row }) => <Typography>{row.original.act_id}</Typography>,
        size: 80
      }),

      columnHelper.accessor('name', {
        header: 'ACT',
        cell: ({ row }) => (
          <Tooltip title={row.original.name}>
            <Typography color='text.primary' className='truncate' sx={{ maxWidth: '300px' }}>
              {row.original.name || 'N/A'}
            </Typography>
          </Tooltip>
        ),
        size: 300
      }),

      columnHelper.accessor('types_1', {
        header: 'CATEGORY 1',
        cell: ({ row }) => (
          <Typography>
            {row.original.types_1 ? (
              <Chip label={row.original.types_1} color='primary' variant='tonal' size='small' />
            ) : (
              'N/A'
            )}
          </Typography>
        ),
        size: 150
      }),

      columnHelper.accessor('types_2', {
        header: 'CATEGORY 2',
        cell: ({ row }) => (
          <Typography>
            {row.original.types_2 ? (
              <Chip label={row.original.types_2} color='secondary' variant='tonal' size='small' />
            ) : (
              'N/A'
            )}
          </Typography>
        ),
        size: 150
      }),

      columnHelper.accessor('types_3', {
        header: 'CATEGORY 3',
        cell: ({ row }) => (
          <Typography>
            {row.original.types_3 ? (
              <Chip label={row.original.types_3} color='info' variant='tonal' size='small' />
            ) : (
              'N/A'
            )}
          </Typography>
        ),
        size: 150
      }),

      columnHelper.accessor('types_4', {
        header: 'CATEGORY 4',
        cell: ({ row }) => (
          <Typography>
            {row.original.types_4 ? (
              <Chip label={row.original.types_4} color='warning' variant='tonal' size='small' />
            ) : (
              'N/A'
            )}
          </Typography>
        ),
        size: 150
      })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data: actsData,
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
        title='View Acts'
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddModalOpen(true)}>
              Add Act Category
            </Button>
            <IconButton onClick={handleRefresh} disabled={isRefreshing || loading}>
              {isRefreshing || loading ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
            </IconButton>
          </Box>
        }
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': { fontSize: '1.25rem' }
        }}
      />

      {/* Search Area */}
      <div className='flex justify-between items-center px-6 py-3'>
        <CustomTextField
          placeholder='Search acts...'
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
      {!loading && actsData.length === 0 && !error && (
        <div className='text-center py-8 text-textSecondary'>No acts found.</div>
      )}

      {/* Table */}
      {!loading && actsData.length > 0 && (
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
      {!loading && actsData.length > 0 && (
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

      {/* Add Act Category Dialog */}
      <AddActCategory open={addModalOpen} setOpen={setAddModalOpen} onSuccess={handleActSuccess} />
    </Card>
  )
}

export default ViewActsTable
