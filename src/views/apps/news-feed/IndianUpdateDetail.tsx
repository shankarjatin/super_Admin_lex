'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import axios from 'axios'
import https from 'https'
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

// Component Imports
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import EditMergeAct from '@/components/dialogs/add-indian-dossier/editMergeAct'

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define types for Indian update data
interface IndianUpdateType {
  sr: number
  company_id: string
  new_title: string
  discription: string
  department: string
  froms: string
  till: string
  status: number
  category: string
  user_role: string
  location: string
  timestamp: string
  link: string
  url: string
  s: number
  updatetime: string
  upload_by: string
  isDeleted: string
}

// Define type for prefill data
interface PrefillDataType {
  id: string | number
  title: string
  description: string
  url: string
  // Add other fields as needed
}

// Column Definitions
const columnHelper = createColumnHelper<IndianUpdateType>()

const IndianUpdateDetail = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState<IndianUpdateType[]>([])

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editDialogPrefillData, setEditDialogPrefillData] = useState<PrefillDataType | null>(null)
  const [loadingPrefillData, setLoadingPrefillData] = useState(false)

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Indian update data on component mount
  useEffect(() => {
    const fetchIndianUpdates = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/getIndianUpdateList')

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setData(response.data.data)
        } else {
          throw new Error('Invalid data format or no data available')
        }
      } catch (error) {
        console.error('Error fetching Indian updates:', error)
        setError('Failed to load Indian updates. Please try again later.')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchIndianUpdates()
  }, [])

  // Function to fetch prefill data for editing
  const fetchPrefillData = async (id: string | number) => {
    try {
      setLoadingPrefillData(true)

      const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/indianUpdatePrefill', {
        params: { id }
      })

      if (response.data && response.data.success) {
        setEditDialogPrefillData(response.data.data)
        setEditDialogOpen(true)
      } else {
        throw new Error('Failed to fetch prefill data')
      }
    } catch (error) {
      console.error('Error fetching prefill data:', error)
      setError('Failed to load edit data. Please try again.')
    } finally {
      setLoadingPrefillData(false)
    }
  }

  // Function to handle debounced input for global filtering
  const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
  }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
      const timeout = setTimeout(() => {
        onChange(value)
      }, debounce)

      return () => clearTimeout(timeout)
    }, [value, onChange, debounce])

    return (
      <CustomTextField
        {...props}
        value={value}
        onChange={e => setValue(e.target.value)}
        fullWidth
        placeholder='Search updates...'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <i className='tabler-search text-xl' />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={() => setValue('')}>
                <i className='tabler-x' />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
    )
  }

  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Handle edit action
  const handleEdit = (row: IndianUpdateType) => {
    // Use sr or a unique identifier from the row for prefilling
    fetchPrefillData(row.sr)
  }

  // Handle delete action
  const handleDelete = (row: IndianUpdateType) => {
    console.log('Delete item:', row)
    // Implement delete functionality
  }

  // Handle dialog close and refresh data if needed
  const handleEditDialogClose = (refresh: boolean = false) => {
    setEditDialogOpen(false)
    setEditDialogPrefillData(null)

    // Optionally refresh data if edit was successful
    if (refresh) {
      const fetchIndianUpdates = async () => {
        try {
          setLoading(true)
          const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/getIndianUpdateList')
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            setData(response.data.data)
          }
        } catch (error) {
          console.error('Error refreshing data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchIndianUpdates()
    }
  }

  // Define columns
  const columns = useMemo<ColumnDef<IndianUpdateType, any>[]>(
    () => [
      // Serial Number column
      columnHelper.accessor('sr', {
        header: 'Sr',
        cell: ({ row }) => <Typography>{row.original.sr}</Typography>,
        size: 60
      }),

      // Date column
      columnHelper.accessor('timestamp', {
        header: 'Date',
        cell: ({ row }) => (
          <Chip label={formatDate(row.original.timestamp)} size='small' variant='tonal' color='primary' />
        ),
        size: 120
      }),

      // News Title column
      columnHelper.accessor('new_title', {
        header: 'News title',
        cell: ({ row }) => (
          <Tooltip title={row.original.new_title}>
            <Typography className='truncate font-medium' sx={{ maxWidth: '250px' }}>
              {row.original.new_title}
            </Typography>
          </Tooltip>
        ),
        size: 250
      }),

      // Acts column (using url field)
      columnHelper.accessor('url', {
        header: 'Acts',
        cell: ({ row }) => (
          <Tooltip title={row.original.url}>
            <Typography className='truncate' sx={{ maxWidth: '300px' }}>
              {row.original.url || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 300
      }),

      // Category column
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ row }) => (
          <Typography className='truncate' sx={{ maxWidth: '150px' }}>
            {row.original.category || '-'}
          </Typography>
        ),
        size: 150
      }),

      // Link column
      columnHelper.accessor('link', {
        header: 'Link',
        cell: ({ row }) => {
          const baseUrl = 'https://ai.lexcomply.co/'
          const downloadLink = row.original.link ? `${baseUrl}${row.original.link}` : null

          return downloadLink ? (
            <Link
              href={downloadLink}
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className='tabler-download text-sm' /> Download
            </Link>
          ) : (
            <Typography>No link</Typography>
          )
        },
        size: 120
      }),

      // Insert Date column (updatetime)
      columnHelper.accessor('updatetime', {
        header: 'Insert Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.updatetime)}</Typography>,
        size: 120
      }),

      // Action column
      columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title='Edit'>
              <IconButton
                size='small'
                color='primary'
                onClick={() => handleEdit(row.original)}
                disabled={loadingPrefillData}
              >
                <i className='tabler-edit text-base' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete'>
              <IconButton size='small' color='error' onClick={() => handleDelete(row.original)}>
                <i className='tabler-trash text-base' />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        size: 100
      })
    ],
    [loadingPrefillData]
  )

  // Set up table
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination: {
        pageSize,
        pageIndex
      },
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader title='Indian Updates' />

      <div className='flex flex-col gap-4 p-6'>
        {/* Error message */}
        {error && (
          <Alert severity='error' sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className='flex justify-center py-4'>
            <CircularProgress />
          </div>
        )}

        {/* Message when no data */}
        {!loading && data.length === 0 && !error && (
          <div className='text-center py-8 text-textSecondary'>No Indian update data available.</div>
        )}
      </div>

      {/* Show table only when data is loaded */}
      {!loading && data.length > 0 && (
        <div className='overflow-x-auto'>
          <Divider />

          {/* Search and rows per page controls */}
          <div className='flex flex-wrap justify-between gap-4 p-6'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search in results'
              className='max-sm:is-full'
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
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Typography>No Indian update data available</Typography>
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
      )}

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditMergeAct
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          prefillData={editDialogPrefillData}
          onSuccess={() => handleEditDialogClose(true)}
        />
      )}
    </Card>
  )
}

export default IndianUpdateDetail
