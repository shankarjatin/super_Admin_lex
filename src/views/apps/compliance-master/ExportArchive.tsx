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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'

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

// Interface for act options from API
interface ActOption {
  id: number | string
  name: string
  state?: string
  scope?: string
}

// Define type for archive export data with all fields
type ArchiveExportDataType = {
  id: string
  description: string
  department: string
  app_geog: string
  state: string
  location: string
  event: string
  event_periodicity: string
  application: string
  exemption: string
  section: string
  sub_section: string
  rule: string
  rule_name: string
  sub_head: string
  criticality: string
  periodicity: string
  applicable_online: string
  site: string
  due_date: string
  triggers: string
  provision: string
  agency: string
  agency_add: string
  remarks: string
  key1: string
  status: number | string
  form_name: string
  form_purpose: string
  potential_impact: string
  act_id: string
  recode: number
  timestampp?: string
  time_stap?: string
  expiry_date: string
  legal_date: string
  wef_date: string
  last_date?: string
  wef_status?: string
  sr?: number
  isDeleted: string
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
  'Half Monthly': { title: 'Half Monthly', color: 'info' },
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
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // States for table
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  // States for acts dropdown
  const [acts, setActs] = useState<ActOption[]>([])
  const [loadingActs, setLoadingActs] = useState<boolean>(false)
  const [selectedAct, setSelectedAct] = useState<string | number>('')

  // Fetch acts on component mount
  useEffect(() => {
    fetchActs()
  }, [])

  // Function to fetch acts from API
  const fetchActs = async () => {
    try {
      setLoadingActs(true)
      setError(null)

      const response = await axiosInstance.get('/complianceMaster/archieveDrop')

      if (response.data && Array.isArray(response.data)) {
        // Direct array of acts from the API
        setActs(response.data)
      } else {
        throw new Error('Invalid data format received from API')
      }
    } catch (err) {
      console.error('Error fetching acts:', err)
      setError('Failed to load acts. Please try again.')

      // Mock data for development
      setActs([
        {
          id: 1,
          name: 'Companies Act, 2013 and amendment thereto and rules notified there under - For Private Companies',
          state: '',
          scope: 'central'
        },
        {
          id: 99999,
          name: 'Event Check Cycle',
          state: 'none',
          scope: 'none'
        },
        {
          id: 100202,
          name: 'Income Tax Act, 1961 and Income Tax Rules, 1962',
          state: '',
          scope: 'central'
        },
        {
          id: 99998,
          name: 'On Going Check Cycle',
          state: 'none',
          scope: 'none'
        }
      ])
    } finally {
      setLoadingActs(false)
    }
  }

  // Fetch archive data based on selected act
  const fetchArchiveData = useCallback(async (actId: string | number) => {
    try {
      setLoading(true)
      setError(null)
      setData([])

      const response = await axiosInstance.get(`/complianceMaster/getArchieveExportList?actId=${actId}`)

      // Check if response has the expected format with data array
      if (response.data?.success && response.data?.data) {
        // Data is in response.data.data (array of records)
        const responseData = Array.isArray(response.data.data) ? response.data.data : [response.data.data]

        // Transform the data to match the table columns
        const transformedData = responseData.map((item: any) => ({
          id: item.id || '',
          description: item.description || '',
          department: item.department || '',
          app_geog: item.app_geog || '',
          state: item.state || '',
          location: item.location || '',
          event: item.event || '',
          event_periodicity: item.event_periodicity || '',
          application: item.application || '',
          exemption: item.exemption || '',
          section: item.section || '',
          sub_section: item.sub_section || '',
          rule: item.rule || '',
          rule_name: item.rule_name || '',
          sub_head: item.sub_head || '',
          criticality: item.criticality || 'Medium',
          periodicity: item.periodicity || 'Monthly',
          applicable_online: item.applicable_online || '',
          site: item.site || '',
          due_date: item.due_date || '',
          triggers: item.triggers || '',
          provision: item.provision || '',
          agency: item.agency || '',
          agency_add: item.agency_add || '',
          remarks: item.remarks || '',
          key1: item.key1 || '',
          status: item.status,
          form_name: item.form_name || '',
          form_purpose: item.form_purpose || '',
          potential_impact: item.potential_impact || '',
          act_id: item.act_id || actId.toString(),
          recode: item.recode || 0,
          time_stap: item.time_stap || '',
          expiry_date: item.expiry_date || '',
          legal_date: item.legal_date || '',
          wef_date: item.wef_date || '',
          last_date: item.last_date || '',
          wef_status: item.wef_status || '',
          isDeleted: item.isDeleted || '0',
          actualStatus: item.status === 1 || item.status === '1' ? 'Active' : 'Inactive'
        }))

        setData(transformedData)
      } else {
        // For API responses that don't follow the expected format
        console.warn('Unexpected API response format:', response.data)
        setError('No data found or unexpected format from API')
        setData([])
      }
    } catch (err) {
      console.error('Error fetching archive data:', err)
      setData([])
      setError('Failed to load archive data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle act selection change
  const handleActChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string | number
    setSelectedAct(value)

    if (value) {
      fetchArchiveData(value)
    } else {
      setData([])
    }
  }

  // Handle refresh data
  const handleRefresh = () => {
    if (selectedAct) {
      fetchArchiveData(selectedAct)
    }
  }

  // Handle export data
  const handleExport = () => {
    if (!selectedAct || data.length === 0) return

    // Implement export logic here (e.g., CSV/Excel export)
    console.log('Exporting data for act ID:', selectedAct)

    // Mock implementation - in a real app you would generate a downloadable file
    alert('Export feature would download data here')
  }

  // Define columns for the table
  const columns = useMemo<ColumnDef<ArchiveExportDataType, any>[]>(
    () => [
      // Sr. No. column
      columnHelper.display({
        id: 'srNo',
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

      // App Geography column
      columnHelper.accessor('app_geog', {
        header: 'App Geography',
        cell: ({ row }) => <Typography>{row.original.app_geog || '-'}</Typography>,
        size: 140
      }),

      // State column
      columnHelper.accessor('state', {
        header: 'State',
        cell: ({ row }) => <Typography>{row.original.state || '-'}</Typography>,
        size: 100
      }),

      // Location column
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => <Typography>{row.original.location || '-'}</Typography>,
        size: 120
      }),

      // Event column
      columnHelper.accessor('event', {
        header: 'Event',
        cell: ({ row }) => <Typography>{row.original.event || '-'}</Typography>,
        size: 120
      }),

      // Event Periodicity column
      columnHelper.accessor('event_periodicity', {
        header: 'Event Periodicity',
        cell: ({ row }) => <Typography>{row.original.event_periodicity || '-'}</Typography>,
        size: 140
      }),

      // Application column
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

      // Exemption column
      columnHelper.accessor('exemption', {
        header: 'Exemption',
        cell: ({ row }) => <Typography>{row.original.exemption || '-'}</Typography>,
        size: 100
      }),

      // Section column
      columnHelper.accessor('section', {
        header: 'Section',
        cell: ({ row }) => <Typography>{row.original.section || '-'}</Typography>,
        size: 100
      }),

      // Sub Section column
      columnHelper.accessor('sub_section', {
        header: 'Sub Section',
        cell: ({ row }) => <Typography>{row.original.sub_section || '-'}</Typography>,
        size: 100
      }),

      // Rule column
      columnHelper.accessor('rule', {
        header: 'Rule',
        cell: ({ row }) => <Typography>{row.original.rule || '-'}</Typography>,
        size: 100
      }),

      // Rule Name column
      columnHelper.accessor('rule_name', {
        header: 'Rule Name',
        cell: ({ row }) => <Typography>{row.original.rule_name || '-'}</Typography>,
        size: 120
      }),

      // Sub Head column
      columnHelper.accessor('sub_head', {
        header: 'Sub Head',
        cell: ({ row }) => <Typography>{row.original.sub_head || '-'}</Typography>,
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

      // Periodicity column
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

      // Applicable Online column
      columnHelper.accessor('applicable_online', {
        header: 'Applicable Online',
        cell: ({ row }) => <Typography>{row.original.applicable_online || '-'}</Typography>,
        size: 130
      }),

      // Site column
      columnHelper.accessor('site', {
        header: 'Site',
        cell: ({ row }) => <Typography>{row.original.site || '-'}</Typography>,
        size: 100
      }),

      // Due Date column
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{row.original.due_date || '-'}</Typography>,
        size: 100
      }),

      // Triggers column
      columnHelper.accessor('triggers', {
        header: 'Triggers',
        cell: ({ row }) => <Typography>{row.original.triggers || '-'}</Typography>,
        size: 100
      }),

      // Provision column
      columnHelper.accessor('provision', {
        header: 'Provision',
        cell: ({ row }) => <Typography>{row.original.provision || '-'}</Typography>,
        size: 120
      }),

      // Agency column
      columnHelper.accessor('agency', {
        header: 'Agency',
        cell: ({ row }) => <Typography>{row.original.agency || '-'}</Typography>,
        size: 120
      }),

      // Agency Address column
      columnHelper.accessor('agency_add', {
        header: 'Agency Address',
        cell: ({ row }) => (
          <Tooltip title={row.original.agency_add}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.agency_add || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 140
      }),

      // Remarks column
      columnHelper.accessor('remarks', {
        header: 'Remarks',
        cell: ({ row }) => (
          <Tooltip title={row.original.remarks}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.remarks || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Key column
      columnHelper.accessor('key1', {
        header: 'Key',
        cell: ({ row }) => <Typography>{row.original.key1 || '-'}</Typography>,
        size: 80
      }),

      // Status column
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status === 1 || row.original.status === '1' ? 'Active' : 'Inactive'
          return <Chip label={status} color={status === 'Active' ? 'success' : 'error'} variant='tonal' size='small' />
        },
        size: 100
      }),

      // Form Name column
      columnHelper.accessor('form_name', {
        header: 'Form Name',
        cell: ({ row }) => <Typography>{row.original.form_name || '-'}</Typography>,
        size: 120
      }),

      // Form Purpose column
      columnHelper.accessor('form_purpose', {
        header: 'Form Purpose',
        cell: ({ row }) => (
          <Tooltip title={row.original.form_purpose}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.form_purpose || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 130
      }),

      // Potential Impact column
      columnHelper.accessor('potential_impact', {
        header: 'Potential Impact',
        cell: ({ row }) => <Typography>{row.original.potential_impact || '-'}</Typography>,
        size: 130
      }),

      // Act ID column
      columnHelper.accessor('act_id', {
        header: 'Act ID',
        cell: ({ row }) => <Typography>{row.original.act_id || '-'}</Typography>,
        size: 80
      }),

      // Recode column
      columnHelper.accessor('recode', {
        header: 'Recode',
        cell: ({ row }) => <Typography>{row.original.recode || '-'}</Typography>,
        size: 80
      }),

      // Timestamp column
      columnHelper.accessor(row => row.time_stap || row.timestampp || '', {
        id: 'timestamp',
        header: 'Timestamp',
        cell: ({ getValue }) => {
          const timestamp = getValue()
          return <Typography>{timestamp || '-'}</Typography>
        },
        size: 150
      }),

      // Expiry Date column
      columnHelper.accessor('expiry_date', {
        header: 'Expiry Date',
        cell: ({ row }) => <Typography>{row.original.expiry_date || '-'}</Typography>,
        size: 100
      }),

      // Legal Date column
      columnHelper.accessor('legal_date', {
        header: 'Legal Date',
        cell: ({ row }) => <Typography>{row.original.legal_date || '-'}</Typography>,
        size: 100
      }),

      // WEF Date column
      columnHelper.accessor('wef_date', {
        header: 'WEF Date',
        cell: ({ row }) => <Typography>{row.original.wef_date || '-'}</Typography>,
        size: 100
      }),

      // Actual Status column
      columnHelper.accessor('actualStatus', {
        header: 'Actual Status',
        cell: ({ row }) => <Typography>{row.original.actualStatus || '-'}</Typography>,
        size: 120
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
        title='Export Archive'
        action={
          <Button
            variant='contained'
            startIcon={<i className='tabler-refresh' />}
            onClick={handleRefresh}
            disabled={!selectedAct || loading}
          >
            Refresh
          </Button>
        }
      />

      <Divider />

      {/* Act Selection Dropdown */}
      <Box sx={{ p: 6 }}>
        <FormControl fullWidth>
          <InputLabel id='act-select-label'>Select Act</InputLabel>
          <Select
            labelId='act-select-label'
            id='act-select'
            value={selectedAct}
            label='Select Act'
            onChange={handleActChange}
            disabled={loadingActs}
          >
            {acts.length === 0 ? (
              <MenuItem disabled>No acts available</MenuItem>
            ) : (
              acts.map(act => (
                <MenuItem key={act.id} value={act.id}>
                  {act.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

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
            disabled={!selectedAct || data.length === 0}
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
          <table className={tableStyles.table} style={{ minWidth: '1800px' }}>
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
                    {!selectedAct ? (
                      <Typography>Please select an act to view archives</Typography>
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
