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
import Chip from '@mui/material/Chip'

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
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import EditIndustryType from '@/components/dialogs/edit-industry-type'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define types for act type data
interface ActTypeData {
  id: number
  name: string
  scope: string
  state: string
  industry_type: string
}

// Column Definitions
const columnHelper = createColumnHelper<ActTypeData>()

const ActTypeTable = () => {
  // States
  const [data, setData] = useState<ActTypeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedAct, setSelectedAct] = useState<ActTypeData | null>(null)

  // Fetch act types from API
  const fetchActTypes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/getActType')

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setData(response.data.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching act types:', error)
      setError('Failed to load act types. Please try again later.')
      setData([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchActTypes()
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchActTypes()
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
        placeholder='Search act types...'
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

  // Handle opening edit modal
  const handleEditClick = (act: ActTypeData) => {
    setSelectedAct(act)
    setEditModalOpen(true)
  }

  // Handle successful industry type update
  const handleEditSuccess = (updatedAct: ActTypeData) => {
    // Update the data in state
    setData(data.map(item => (item.id === updatedAct.id ? updatedAct : item)))
  }

  // Define columns
  const columns = useMemo<ColumnDef<ActTypeData, any>[]>(
    () => [
      // Serial Number column
      columnHelper.accessor('id', {
        id: 'serialNumber',
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 60
      }),

      // ID column
      columnHelper.accessor('id', {
        header: 'Act ID',
        cell: ({ row }) => (
          <Typography color='primary' fontWeight={500}>
            {row.original.id}
          </Typography>
        ),
        size: 100
      }),

      // Name column
      columnHelper.accessor('name', {
        header: 'Act Name',
        cell: ({ row }) => (
          <Tooltip title={row.original.name}>
            <Typography className='truncate font-medium' sx={{ maxWidth: '300px' }}>
              {row.original.name}
            </Typography>
          </Tooltip>
        ),
        size: 400
      }),

      // Scope column
      columnHelper.accessor('scope', {
        header: 'Scope',
        cell: ({ row }) => (
          <Chip
            label={
              row.original.scope === 'none'
                ? 'N/A'
                : row.original.scope.charAt(0).toUpperCase() + row.original.scope.slice(1)
            }
            color={
              row.original.scope === 'central' ? 'primary' : row.original.scope === 'state' ? 'secondary' : 'default'
            }
            variant='tonal'
            size='small'
          />
        ),
        size: 120
      }),

      // State column
      columnHelper.accessor('state', {
        header: 'State',
        cell: ({ row }) => (
          <Typography>{row.original.state && row.original.state !== 'none' ? row.original.state : 'N/A'}</Typography>
        ),
        size: 120
      }),

      // Industry Type column
      columnHelper.accessor('industry_type', {
        header: 'Industry Type',
        cell: ({ row }) => <Typography>{formatIndustryType(row.original.industry_type)}</Typography>,
        size: 180
      }),

      // Actions column
      columnHelper.accessor('id', {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton color='primary' onClick={() => handleEditClick(row.original)} size='small' sx={{ mr: 1 }}>
              <i className='tabler-edit text-xl' />
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View Details',
                  icon: 'tabler-eye',
                  menuItemProps: { onClick: () => console.log('View', row.original.id) }
                }
              ]}
            />
          </Box>
        ),
        enableSorting: false,
        size: 120
      })
    ],
    []
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

  // Show loading spinner when data is loading
  if (loading && data.length === 0) {
    return (
      <Card>
        <CardHeader title='Act Types' />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Act Types'
        action={
          <IconButton onClick={handleRefresh} disabled={isRefreshing || loading}>
            {isRefreshing || loading ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
          </IconButton>
        }
      />

      <Divider />

      {/* Error message if API call fails */}
      {error && (
        <Alert severity='error' sx={{ mx: 3, mb: 3, mt: 3 }}>
          {error}
        </Alert>
      )}

      <div className='overflow-x-auto'>
        {/* Search and rows per page controls */}
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
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

        {/* No data message */}
        {data.length === 0 && !loading && !error && (
          <Typography sx={{ textAlign: 'center', p: 6 }}>No act types available</Typography>
        )}

        {/* Table */}
        {data.length > 0 && (
          <>
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
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
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
          </>
        )}
      </div>

      {/* Edit Industry Type Dialog */}
      <EditIndustryType
        open={editModalOpen}
        setOpen={setEditModalOpen}
        selectedAct={selectedAct}
        onSuccess={handleEditSuccess}
      />
    </Card>
  )
}

export default ActTypeTable
