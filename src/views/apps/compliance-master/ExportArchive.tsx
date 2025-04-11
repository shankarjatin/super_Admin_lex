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
interface ArchiveOption {
  id: number
  name: string
  description?: string
}

// Define type for archive export data with all fields
type ArchiveExportDataType = {
  id: string
  srNo?: number
  description?: string
  department?: string
  app_geog?: string
  state?: string
  location?: string
  event?: string
  event_periodicity?: string
  application?: string
  exemption?: string
  section?: string
  sub_section?: string
  rule?: string
  rule_name?: string
  sub_head?: string
  criticality?: string
  periodicity?: string
  applicable_online?: string
  site?: string
  due_date?: string
  triggers?: string
  provision?: string
  agency?: string
  agency_add?: string
  remarks?: string
  key1?: string
  status?: string
  form_name?: string
  form_purpose?: string
  potential_impact?: string
  act_id?: number
  actName?: string
  recode?: number
  timestampp?: string
  expiry_date?: string
  legal_date?: string
  wef_date?: string
  actualStatus?: string
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
const columnHelper = createColumnHelper<ArchiveExportDataType>()

const ExportArchiveTable = () => {
  // States for data
  const [data, setData] = useState<ArchiveExportDataType[]>([])
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
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null)

  // States for autocomplete dropdown
  const [archiveOptions, setArchiveOptions] = useState<ArchiveOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)
  const [selectedArchive, setSelectedArchive] = useState<ArchiveOption | null>(null)
  const [inputValue, setInputValue] = useState<string>('')

  // Fetch archive options for autocomplete dropdown
  useEffect(() => {
    const fetchArchiveOptions = async () => {
      try {
        setLoadingOptions(true)
        setError(null)

        const response = await axiosInstance.get('/complianceMaster/archieveDrop')

        if (response.data && Array.isArray(response.data)) {
          // Transform API response to match dropdown format
          const options = response.data.map((item: any) => ({
            id: item.id || item.actId,
            name: item.name || item.description || 'Untitled Act',
            description: item.description || ''
          }))

          setArchiveOptions(options)
        } else {
          console.error('Invalid API response format:', response.data)
          setArchiveOptions([])
        }
      } catch (err) {
        console.error('Error fetching archive options:', err)
        setError('Failed to load archive options. Please try again.')
        setArchiveOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchArchiveOptions()
  }, [])

  // Fetch archive data based on selected act
  const fetchArchiveData = useCallback(async (actId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get(`/complianceMaster/getArchieveExportList?actId=${actId}`)

      if (response.data && (Array.isArray(response.data) || response.data.data)) {
        // Get the actual data array, handling different response formats
        const dataArray = Array.isArray(response.data) ? response.data : response.data.data || []

        console.log('Archive data:', dataArray)

        // Transform API response to match table data structure with all fields
        const transformedData = dataArray.map((item: any, index: number) => ({
          id: item.id || String(index + 1),
          srNo: index + 1,
          description: item.description || '-',
          department: item.department || '-',
          app_geog: item.app_geog || '-',
          state: item.state || item.stateName || '-',
          location: item.location || '-',
          event: item.event || '-',
          event_periodicity: item.event_periodicity || '-',
          application: item.application || '-',
          exemption: item.exemption || '-',
          section: item.section || '-',
          sub_section: item.sub_section || '-',
          rule: item.rule || '-',
          rule_name: item.rule_name || '-',
          sub_head: item.sub_head || '-',
          criticality: item.criticality || 'Medium',
          periodicity: item.periodicity || 'Monthly',
          applicable_online: item.applicable_online || 'No',
          site: item.site || '-',
          due_date: item.due_date || '-',
          triggers: item.triggers || '-',
          provision: item.provision || '-',
          agency: item.agency || '-',
          agency_add: item.agency_add || '-',
          remarks: item.remarks || '-',
          key1: item.key1 || '-',
          status: item.status === 1 || item.status === true || item.status === '1' ? 'Active' : 'Inactive',
          form_name: item.form_name || '-',
          form_purpose: item.form_purpose || '-',
          potential_impact: item.potential_impact || '-',
          act_id: item.act_id || actId,
          actName: item.actName || item.act || '-',
          recode: item.recode || 0,
          timestampp: item.timestampp || '-',
          expiry_date: item.expiry_date || '-',
          legal_date: item.legal_date || '-',
          wef_date: item.wef_date || '-',
          actualStatus: item.actualStatus || (item.status === 1 ? 'Active' : 'Inactive')
        }))

        setData(transformedData)
      } else {
        console.error('Invalid archive data response:', response.data)
        setData([])
        setError('No data found for the selected act')
      }
    } catch (err) {
      console.error('Error fetching archive data:', err)
      setData([])
      setError('Failed to load archive data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle archive selection from autocomplete
  const handleArchiveChange = (event: any, newValue: ArchiveOption | null) => {
    setSelectedArchive(newValue)

    if (newValue && newValue.id) {
      fetchArchiveData(newValue.id)
    } else {
      // Clear table data if no archive is selected
      setData([])
    }
  }

  // Handle input change in autocomplete
  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue)
  }

  // Handle refresh
  const handleRefresh = () => {
    if (selectedArchive?.id) {
      fetchArchiveData(selectedArchive.id)
    }
  }

  // Handle export (placeholder)
  const handleExport = () => {
    console.log('Export data for archive:', selectedArchive?.id)
    // Implement your export logic here
  }

  // Define columns with all the required fields
  const columns = useMemo<ColumnDef<ArchiveExportDataType, any>[]>(
    () => [
      // Sr. No. column
      columnHelper.accessor('srNo', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 70
      }),

      // ID column
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>,
        size: 80
      }),

      // Description column
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.description}>
            <Typography className='truncate' sx={{ maxWidth: '200px' }}>
              {row.original.description || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 180
      }),

      // Department column
      columnHelper.accessor('department', {
        header: 'Department',
        cell: ({ row }) => <Typography>{row.original.department || '-'}</Typography>,
        size: 120
      }),

      // Application Geography
      columnHelper.accessor('app_geog', {
        header: 'App Geography',
        cell: ({ row }) => <Typography>{row.original.app_geog || '-'}</Typography>,
        size: 140
      }),

      // State
      columnHelper.accessor('state', {
        header: 'State',
        cell: ({ row }) => <Typography>{row.original.state || '-'}</Typography>,
        size: 100
      }),

      // Location
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => <Typography>{row.original.location || '-'}</Typography>,
        size: 120
      }),

      // Event
      columnHelper.accessor('event', {
        header: 'Event',
        cell: ({ row }) => <Typography>{row.original.event || '-'}</Typography>,
        size: 120
      }),

      // Event Periodicity
      columnHelper.accessor('event_periodicity', {
        header: 'Event Periodicity',
        cell: ({ row }) => <Typography>{row.original.event_periodicity || '-'}</Typography>,
        size: 140
      }),

      // Application
      columnHelper.accessor('application', {
        header: 'Application',
        cell: ({ row }) => (
          <Tooltip title={row.original.application}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.application || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Exemption
      columnHelper.accessor('exemption', {
        header: 'Exemption',
        cell: ({ row }) => (
          <Tooltip title={row.original.exemption}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.exemption || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Section
      columnHelper.accessor('section', {
        header: 'Section',
        cell: ({ row }) => <Typography>{row.original.section || '-'}</Typography>,
        size: 100
      }),

      // Sub Section
      columnHelper.accessor('sub_section', {
        header: 'Sub Section',
        cell: ({ row }) => <Typography>{row.original.sub_section || '-'}</Typography>,
        size: 120
      }),

      // Rule
      columnHelper.accessor('rule', {
        header: 'Rule',
        cell: ({ row }) => <Typography>{row.original.rule || '-'}</Typography>,
        size: 100
      }),

      // Rule Name
      columnHelper.accessor('rule_name', {
        header: 'Rule Name',
        cell: ({ row }) => <Typography>{row.original.rule_name || '-'}</Typography>,
        size: 120
      }),

      // Sub Head
      columnHelper.accessor('sub_head', {
        header: 'Sub Head',
        cell: ({ row }) => <Typography>{row.original.sub_head || '-'}</Typography>,
        size: 120
      }),

      // Criticality
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

      // Periodicity
      columnHelper.accessor('periodicity', {
        header: 'Periodicity',
        cell: ({ row }) => {
          const periodicity = row.original.periodicity || 'Monthly'
          return (
            <Chip label={periodicity} color={statusObj[periodicity]?.color || 'primary'} variant='tonal' size='small' />
          )
        },
        size: 120
      }),

      // Applicable Online
      columnHelper.accessor('applicable_online', {
        header: 'Applicable Online',
        cell: ({ row }) => <Typography>{row.original.applicable_online || '-'}</Typography>,
        size: 140
      }),

      // Site
      columnHelper.accessor('site', {
        header: 'Site',
        cell: ({ row }) => <Typography>{row.original.site || '-'}</Typography>,
        size: 100
      }),

      // Due Date
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{row.original.due_date || '-'}</Typography>,
        size: 120
      }),

      // Triggers
      columnHelper.accessor('triggers', {
        header: 'Triggers',
        cell: ({ row }) => <Typography>{row.original.triggers || '-'}</Typography>,
        size: 100
      }),

      // Provision
      columnHelper.accessor('provision', {
        header: 'Provision',
        cell: ({ row }) => (
          <Tooltip title={row.original.provision}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.provision || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Agency
      columnHelper.accessor('agency', {
        header: 'Agency',
        cell: ({ row }) => <Typography>{row.original.agency || '-'}</Typography>,
        size: 120
      }),

      // Agency Address
      columnHelper.accessor('agency_add', {
        header: 'Agency Address',
        cell: ({ row }) => (
          <Tooltip title={row.original.agency_add}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.agency_add || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Remarks
      columnHelper.accessor('remarks', {
        header: 'Remarks',
        cell: ({ row }) => (
          <Tooltip title={row.original.remarks}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.remarks || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Key1
      columnHelper.accessor('key1', {
        header: 'Key1',
        cell: ({ row }) => (
          <Tooltip title={row.original.key1}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.key1 || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Status
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'Inactive'
          return <Chip label={status} color={statusObj[status]?.color || 'default'} variant='tonal' size='small' />
        },
        size: 100
      }),

      // Form Name
      columnHelper.accessor('form_name', {
        header: 'Form Name',
        cell: ({ row }) => <Typography>{row.original.form_name || '-'}</Typography>,
        size: 120
      }),

      // Form Purpose
      columnHelper.accessor('form_purpose', {
        header: 'Form Purpose',
        cell: ({ row }) => (
          <Tooltip title={row.original.form_purpose}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.form_purpose || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Potential Impact
      columnHelper.accessor('potential_impact', {
        header: 'Potential Impact',
        cell: ({ row }) => (
          <Tooltip title={row.original.potential_impact}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.potential_impact || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Act ID
      columnHelper.accessor('act_id', {
        header: 'Act ID',
        cell: ({ row }) => <Typography>{row.original.act_id || '-'}</Typography>,
        size: 80
      }),

      // Recode
      columnHelper.accessor('recode', {
        header: 'Recode',
        cell: ({ row }) => <Typography>{row.original.recode || '-'}</Typography>,
        size: 80
      }),

      // Timestamp
      columnHelper.accessor('timestampp', {
        header: 'Timestamp',
        cell: ({ row }) => <Typography>{row.original.timestampp || '-'}</Typography>,
        size: 150
      }),

      // Expiry Date
      columnHelper.accessor('expiry_date', {
        header: 'Expiry Date',
        cell: ({ row }) => <Typography>{row.original.expiry_date || '-'}</Typography>,
        size: 120
      }),

      // Legal Date
      columnHelper.accessor('legal_date', {
        header: 'Legal Date',
        cell: ({ row }) => <Typography>{row.original.legal_date || '-'}</Typography>,
        size: 120
      }),

      // WEF Date
      columnHelper.accessor('wef_date', {
        header: 'WEF Date',
        cell: ({ row }) => <Typography>{row.original.wef_date || '-'}</Typography>,
        size: 120
      }),

      // Actual Status
      columnHelper.accessor('actualStatus', {
        header: 'Actual Status',
        cell: ({ row }) => {
          const status = row.original.actualStatus || 'Inactive'
          return <Chip label={status} color={statusObj[status]?.color || 'default'} variant='tonal' size='small' />
        },
        size: 120
      }),

      // Export column
      columnHelper.accessor('export', {
        header: 'Export',
        cell: ({ row }) => (
          <IconButton size='small' color='primary' onClick={() => handleExport()}>
            <i className='tabler-download' />
          </IconButton>
        ),
        size: 80
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

  // Handle successful refresh
  const handleSuccess = () => {
    if (selectedArchive?.id) {
      fetchArchiveData(selectedArchive.id)
    }
  }

  return (
    <Card>
      <CardHeader
        title='Export Archive'
        action={
          <Button
            variant='contained'
            startIcon={<i className='tabler-refresh' />}
            onClick={handleRefresh}
            disabled={!selectedArchive || loading}
          >
            Refresh
          </Button>
        }
      />

      <Divider />

      {/* Autocomplete dropdown */}
      <div className='p-6'>
        <CustomAutocomplete
          fullWidth
          options={archiveOptions}
          value={selectedArchive}
          loading={loadingOptions}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleArchiveChange}
          id='archive-select'
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => (
            <CustomTextField
              {...params}
              label='Search Acts for Archive'
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
            onClick={handleExport}
            startIcon={<i className='tabler-file-export' />}
            disabled={!selectedArchive || data.length === 0}
          >
            Export
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
          <table className={tableStyles.table} style={{ minWidth: '1100px' }}>
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
                    {!selectedArchive ? (
                      <Typography>Please select an act from the dropdown to view archives</Typography>
                    ) : (
                      <Typography>No archive data available for the selected act</Typography>
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
    </Card>
  )
}

export default ExportArchiveTable
