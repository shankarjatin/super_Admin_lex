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
import Switch from '@mui/material/Switch'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'

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
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import AddFutureCompliance from '@/components/dialogs/compliance-master/addFuture'

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

// Interface for autocomplete options
interface FutureComplianceOption {
  id: number
  name: string
  description?: string
}

// Define type for future compliance data
type FutureComplianceDataType = {
  id: string
  srNo?: number
  act: string
  complianceDesc: string
  applicabilityGeog: string
  stateName: string
  criticality: string
  periodicity: string
  status: string
  edit?: boolean
  delete?: boolean
  // Additional fields
  website?: string
  history?: boolean
  expiry_date?: string
  due_date?: string
  dormant?: boolean
  creation?: string
  effected?: string
}

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
  'On Event': { title: 'On Event', color: 'error' },
  Active: { title: 'Active', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<FutureComplianceDataType>()

const FutureComplianceTable = () => {
  // States for data
  const [data, setData] = useState<FutureComplianceDataType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // States for table
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  // States for dialogs
  const [futureDialogOpen, setFutureDialogOpen] = useState<boolean>(false)
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null)

  // States for autocomplete dropdown
  const [complianceOptions, setComplianceOptions] = useState<FutureComplianceOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const [selectedCompliance, setSelectedCompliance] = useState<FutureComplianceOption | null>(null)
  const [inputValue, setInputValue] = useState<string>('')

  // Fetch compliance options for autocomplete dropdown
  useEffect(() => {
    const fetchComplianceOptions = async () => {
      try {
        setLoadingOptions(true)
        setError(null)

        const response = await axiosInstance.get('/complianceMaster/getFutureComplianceDrop')

        if (response.data && Array.isArray(response.data)) {
          // Transform API response to match dropdown format
          const options = response.data.map((item: any) => ({
            id: item.id || item.complianceId,
            name: item.name || item.description || 'Untitled Compliance',
            description: item.description || ''
          }))

          setComplianceOptions(options)
        } else {
          console.error('Invalid API response format:', response.data)
          setComplianceOptions([])
        }
      } catch (err) {
        console.error('Error fetching compliance options:', err)
        setError('Failed to load compliance options. Please try again.')
        setComplianceOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchComplianceOptions()
  }, [])

  // Fetch compliance data based on selected compliance
  const fetchComplianceData = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get(`/complianceMaster/getFutureComplianceList?id=${id}`)

      if (response.data && Array.isArray(response.data)) {
        // Transform API response to match table data structure
        const transformedData = response.data.map((item: any, index: number) => ({
          id: item.id || String(index + 1),
          srNo: index + 1,
          act: item.actName || item.act || '-',
          complianceDesc: item.description || item.complianceDesc || '-',
          applicabilityGeog: item.applicabilityGeog || item.scope || '-',
          stateName: item.stateName || item.state || '-',
          criticality: item.criticality || 'Medium',
          periodicity: item.periodicity || 'Monthly',
          status: item.status === 1 || item.status === true || item.status === '1' ? 'Active' : 'Inactive',
          // Additional fields
          website: item.website || '',
          expiry_date: item.expiryDate || item.expiry_date || '',
          due_date: item.dueDate || item.due_date || ''
        }))

        setData(transformedData)
      } else {
        console.error('Invalid compliance data response:', response.data)
        setData([])
        setError('No data found for the selected compliance')
      }
    } catch (err) {
      console.error('Error fetching compliance data:', err)
      setData([])
      setError('Failed to load compliance data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle compliance selection from autocomplete
  const handleComplianceChange = (event: any, newValue: FutureComplianceOption | null) => {
    setSelectedCompliance(newValue)

    if (newValue && newValue.id) {
      fetchComplianceData(newValue.id)
    } else {
      // Clear table data if no compliance is selected
      setData([])
    }
  }

  // Handle input change in autocomplete
  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue)
  }

  // Handle refresh
  const handleRefresh = () => {
    if (selectedCompliance?.id) {
      fetchComplianceData(selectedCompliance.id)
    }
  }

  // Handle edit
  const handleEdit = (id: string) => {
    const itemToEdit = data.find(item => item.id === id)
    setSelectedItemForEdit(itemToEdit)
    setFutureDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this compliance?')) return

    try {
      setLoading(true)

      const response = await axiosInstance.post('/futureCompliance/delete', { id })

      if (response.data && response.data.success) {
        // Remove deleted item from table
        setData(prevData => prevData.filter(item => item.id !== id))
        alert('Compliance deleted successfully')
      } else {
        throw new Error(response.data?.message || 'Failed to delete compliance')
      }
    } catch (err) {
      console.error('Error deleting compliance:', err)
      alert('Failed to delete compliance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle export
  const handleExport = () => {
    console.log('Export data')
    // Implement export functionality
  }

  // Define columns
  const columns = useMemo<ColumnDef<FutureComplianceDataType, any>[]>(
    () => [
      // Sr. No. column
      columnHelper.accessor('srNo', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 70
      }),

      // Act column
      columnHelper.accessor('act', {
        header: 'Act',
        cell: ({ row }) => (
          <Tooltip title={row.original.act}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.act || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // ComplianceDesc column
      columnHelper.accessor('complianceDesc', {
        header: 'Compliance Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.complianceDesc}>
            <Typography className='truncate' sx={{ maxWidth: '200px' }}>
              {row.original.complianceDesc || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 200
      }),

      // Applicability-Geog column
      columnHelper.accessor('applicabilityGeog', {
        header: 'Applicability-Geog',
        cell: ({ row }) => (
          <Tooltip title={row.original.applicabilityGeog}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.applicabilityGeog || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // State Name column
      columnHelper.accessor('stateName', {
        header: 'State Name',
        cell: ({ row }) => (
          <Tooltip title={row.original.stateName}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.stateName || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Criticality column
      columnHelper.accessor('criticality', {
        header: 'Criticality',
        cell: ({ row }) => {
          const criticality = row.original.criticality || 'Medium'
          return (
            <Chip label={criticality} color={statusObj[criticality]?.color || 'default'} variant='tonal' size='small' />
          )
        },
        size: 100
      }),

      // Status column
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'Inactive'
          return <Chip label={status} color={statusObj[status]?.color || 'default'} variant='tonal' size='small' />
        },
        size: 100
      }),

      // Edit column
      columnHelper.accessor('edit', {
        header: 'Edit',
        cell: ({ row }) => (
          <IconButton size='small' color='primary' onClick={() => handleEdit(row.original.id)}>
            <i className='tabler-edit' />
          </IconButton>
        ),
        size: 60
      }),

      // Delete column
      columnHelper.accessor('delete', {
        header: 'Delete',
        cell: ({ row }) => (
          <IconButton size='small' color='error' onClick={() => handleDelete(row.original.id)}>
            <i className='tabler-trash' />
          </IconButton>
        ),
        size: 60
      })
    ],
    [handleEdit, handleDelete]
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
    if (selectedCompliance?.id) {
      fetchComplianceData(selectedCompliance.id)
    }
  }

  return (
    <Card>
      <CardHeader
        title='Future Compliance'
        action={
          <Button
            variant='contained'
            startIcon={<i className='tabler-plus' />}
            onClick={() => setFutureDialogOpen(true)}
          >
            Add Future Compliance
          </Button>
        }
      />

      <Divider />

      {/* Autocomplete dropdown */}
      <div className='p-6'>
        <CustomAutocomplete
          fullWidth
          options={complianceOptions}
          value={selectedCompliance}
          loading={loadingOptions}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleComplianceChange}
          id='future-compliance-select'
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => (
            <CustomTextField
              {...params}
              label='Search Future Compliance'
              placeholder='Start typing to search'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingOptions ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </div>

      <Divider />

      {/* Error message */}
      {error && (
        <Alert severity='error' sx={{ mx: 3, my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and refresh area */}
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <CustomTextField
          placeholder='Search in results...'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className='max-sm:is-full'
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
          <Tooltip title='Refresh data'>
            <IconButton onClick={handleRefresh} disabled={loading || !selectedCompliance}>
              {loading ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
            </IconButton>
          </Tooltip>

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

      {/* Table section */}
      <div className='relative w-full'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10'>
            <CircularProgress />
          </div>
        )}

        <div className='overflow-x-auto w-full'>
          <table className={tableStyles.table} style={{ minWidth: '1100px' }}>
            <colgroup>
              {table.getAllColumns().map(column => (
                <col key={column.id} style={{ width: `${column.getSize()}px` }} />
              ))}
            </colgroup>

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
                    {!selectedCompliance ? (
                      <Typography>Please select a compliance from the dropdown to view details</Typography>
                    ) : (
                      <Typography>No data available for the selected compliance</Typography>
                    )}
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

      {/* Add/Edit Future Compliance Dialog */}
      <AddFutureCompliance
        open={futureDialogOpen}
        setOpen={setFutureDialogOpen}
        data={selectedItemForEdit}
        onSuccess={handleSuccess}
      />
    </Card>
  )
}

export default FutureComplianceTable
