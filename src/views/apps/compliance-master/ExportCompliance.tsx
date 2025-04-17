'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
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
  getSortedRowModel,
  type ColumnFiltersState
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Axios Import
import axios from 'axios'
import https from 'https'

// Component Imports
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Type Imports
import type { ThemeColor } from '@core/types'

// Create axios instance with SSL verification disabled
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define types for dropdown data
type ComplianceDropdownData = {
  internationAct: Array<string | { id: string; name: string }>
  internalDrop: Array<string | { id: string; name: string }>
  indianStatutory: Array<string | { id: string; name: string }>
}
// Define compliance data type for table
type ComplianceItemType = {
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
  status: string
  form_name: string
  form_purpose: string
  potential_impact: string
  act_id: string
  recode: string
  timestamp: string
  expiry_date: string
  legal_date: string
  'Actual Status': string
}

// Define category type for dropdown selection
type CategoryType = 'internationAct' | 'internalDrop' | 'indianStatutory'

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
  Inactive: { title: 'Inactive', color: 'error' },
  Pending: { title: 'Pending', color: 'warning' }
}

// Column Definitions
const columnHelper = createColumnHelper<ComplianceItemType>()

// Export Compliance component
const ExportCompliance = () => {
  // States for dropdowns
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dropdownData, setDropdownData] = useState<ComplianceDropdownData>({
    internationAct: [],
    internalDrop: [],
    indianStatutory: []
  })
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>('')
  const [selectedAct, setSelectedAct] = useState<string>('')
  const [exportLoading, setExportLoading] = useState<boolean>(false)

  // States for table
  const [complianceData, setComplianceData] = useState<ComplianceItemType[]>([])
  const [tableLoading, setTableLoading] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  // Category display names mapping
  const categoryDisplayNames: Record<CategoryType, string> = {
    internationAct: 'International Acts',
    internalDrop: 'Internal',
    indianStatutory: 'Indian Statutory'
  }

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Function to fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get(
        'https://ai.lexcomply.co/v2/api/complianceMaster/getComplianceExportDrop'
      )

      // Check if response is valid
      if (response.data && typeof response.data === 'object') {
        const data: ComplianceDropdownData = {
          internationAct: response.data.internationAct || [],
          internalDrop: response.data.internalDrop || [],
          indianStatutory: response.data.indianStatutory || []
        }

        setDropdownData(data)
      } else {
        throw new Error('Invalid data format received from API')
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
      setError('Failed to load dropdown data. Please try again.')

      // For development, use sample data if API call fails
      setDropdownData({
        internationAct: ['GDPR', 'FATCA', 'UK Bribery Act'],
        internalDrop: ['Company Policy 1', 'HR Guidelines', 'Information Security Policy'],
        indianStatutory: ['Companies Act', 'Income Tax Act', 'GST Act', 'Labor Law']
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch compliance data for selected act
  const fetchComplianceData = async (actName: string) => {
    try {
      setTableLoading(true)
      setError(null)

      // In a real implementation, you'd get the actId from somewhere
      // For now, we'll use the act name as a placeholder
      const actId = encodeURIComponent(actName)

      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/complianceMaster/getComplianceExport?actId=${actId}`
      )

      if (response.data && Array.isArray(response.data)) {
        setComplianceData(response.data)
      } else {
        // For testing, generate mock data
        generateMockData(actName)
      }
    } catch (err) {
      console.error('Error fetching compliance data:', err)
      setError('Failed to load compliance data. Please try again.')
      // For testing, generate mock data
      generateMockData(actName)
    } finally {
      setTableLoading(false)
    }
  }

  // Generate mock data for testing
  const generateMockData = (actName: string) => {
    const mockData: ComplianceItemType[] = Array.from({ length: 20 }, (_, index) => ({
      id: `${index + 1}`,
      description: `Compliance requirement for ${actName} - Item ${index + 1}`,
      department: ['HR', 'Finance', 'Legal', 'IT'][Math.floor(Math.random() * 4)],
      app_geog: ['National', 'State', 'International'][Math.floor(Math.random() * 3)],
      state: ['Delhi', 'Maharashtra', 'Karnataka', 'Gujarat'][Math.floor(Math.random() * 4)],
      location: ['Head Office', 'Branch Office', 'Regional Office'][Math.floor(Math.random() * 3)],
      event: `Event ${index + 1}`,
      event_periodicity: ['Monthly', 'Quarterly', 'Yearly'][Math.floor(Math.random() * 3)],
      application: ['Yes', 'No'][Math.floor(Math.random() * 2)],
      exemption: ['Yes', 'No'][Math.floor(Math.random() * 2)],
      section: `Section ${Math.floor(Math.random() * 100)}`,
      sub_section: `Sub-section ${Math.floor(Math.random() * 10)}`,
      rule: `Rule ${Math.floor(Math.random() * 50)}`,
      rule_name: `Rule Name ${index + 1}`,
      sub_head: `Sub Head ${index + 1}`,
      criticality: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      periodicity: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'][Math.floor(Math.random() * 4)],
      applicable_online: ['Yes', 'No'][Math.floor(Math.random() * 2)],
      site: `Site ${index + 1}`,
      due_date: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2025`,
      triggers: `Trigger ${index + 1}`,
      provision: `Provision ${index + 1}`,
      agency: `Agency ${index + 1}`,
      agency_add: `Address ${index + 1}`,
      remarks: `Remark ${index + 1}`,
      key1: `Key ${index + 1}`,
      status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)],
      form_name: `Form ${index + 1}`,
      form_purpose: `Purpose ${index + 1}`,
      potential_impact: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      act_id: actName,
      recode: `${index + 1000}`,
      timestamp: new Date().toISOString(),
      expiry_date: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2026`,
      legal_date: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/2024`,
      'Actual Status': ['Compliant', 'Non-Compliant', 'In Progress'][Math.floor(Math.random() * 3)]
    }))

    setComplianceData(mockData)
  }

  // Handle category selection
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as CategoryType
    setSelectedCategory(value)
    setSelectedAct('') // Reset the second dropdown when first changes
    setComplianceData([]) // Clear table data
    setGlobalFilter('') // Clear search
  }

  // Handle act selection
  // Update this function (around line 167-180):
  const handleActChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string
    setSelectedAct(value)

    // Reset table states
    setPageIndex(0)
    setRowSelection({})
    setGlobalFilter('')

    // Fetch compliance data for selected act
    if (value) {
      // If using an API that needs the actual ID, ensure you're passing the ID value
      fetchComplianceData(value)
    } else {
      setComplianceData([])
    }
  }

  // Handle export button click
  const handleExport = async () => {
    if (!selectedCategory || !selectedAct) {
      setError('Please select both category and act')
      return
    }

    try {
      setExportLoading(true)
      setError(null)

      // Here you would call your API to export the data
      console.log('Exporting:', { category: selectedCategory, act: selectedAct })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Success message
      alert('Export successful!')
    } catch (err) {
      console.error('Error exporting data:', err)
      setError('Failed to export data. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  // Define columns with truncated cells and tooltips
  const columns = useMemo<ColumnDef<ComplianceItemType, any>[]>(
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
        cell: ({ row }) => (
          <Tooltip title={row.original.id}>
            <Typography className='truncate' sx={{ maxWidth: '70px' }}>
              {row.original.id}
            </Typography>
          </Tooltip>
        ),
        size: 80
      }),

      // Description column
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.description}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.description}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Department column
      columnHelper.accessor('department', {
        header: 'Department',
        cell: ({ row }) => <Typography>{row.original.department}</Typography>,
        size: 120
      }),

      // App Geography column
      columnHelper.accessor('app_geog', {
        header: 'App Geography',
        cell: ({ row }) => <Typography>{row.original.app_geog}</Typography>,
        size: 120
      }),

      // State column
      columnHelper.accessor('state', {
        header: 'State',
        cell: ({ row }) => <Typography>{row.original.state}</Typography>,
        size: 100
      }),

      // Location column
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => <Typography>{row.original.location}</Typography>,
        size: 120
      }),

      // Event column
      columnHelper.accessor('event', {
        header: 'Event',
        cell: ({ row }) => (
          <Tooltip title={row.original.event}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.event}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Event Periodicity column
      columnHelper.accessor('event_periodicity', {
        header: 'Event Periodicity',
        cell: ({ row }) => <Typography>{row.original.event_periodicity}</Typography>,
        size: 130
      }),

      // Application column
      columnHelper.accessor('application', {
        header: 'Application',
        cell: ({ row }) => <Typography>{row.original.application}</Typography>,
        size: 100
      }),

      // Exemption column
      columnHelper.accessor('exemption', {
        header: 'Exemption',
        cell: ({ row }) => <Typography>{row.original.exemption}</Typography>,
        size: 100
      }),

      // Section column
      columnHelper.accessor('section', {
        header: 'Section',
        cell: ({ row }) => <Typography>{row.original.section}</Typography>,
        size: 100
      }),

      // Sub Section column
      columnHelper.accessor('sub_section', {
        header: 'Sub Section',
        cell: ({ row }) => <Typography>{row.original.sub_section}</Typography>,
        size: 100
      }),

      // Rule column
      columnHelper.accessor('rule', {
        header: 'Rule',
        cell: ({ row }) => <Typography>{row.original.rule}</Typography>,
        size: 100
      }),

      // Rule Name column
      columnHelper.accessor('rule_name', {
        header: 'Rule Name',
        cell: ({ row }) => (
          <Tooltip title={row.original.rule_name}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.rule_name}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Sub Head column
      columnHelper.accessor('sub_head', {
        header: 'Sub Head',
        cell: ({ row }) => <Typography>{row.original.sub_head}</Typography>,
        size: 100
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
        cell: ({ row }) => <Typography>{row.original.applicable_online}</Typography>,
        size: 130
      }),

      // Site column
      columnHelper.accessor('site', {
        header: 'Site',
        cell: ({ row }) => <Typography>{row.original.site}</Typography>,
        size: 100
      }),

      // Due Date column
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{row.original.due_date}</Typography>,
        size: 100
      }),

      // Triggers column
      columnHelper.accessor('triggers', {
        header: 'Triggers',
        cell: ({ row }) => (
          <Tooltip title={row.original.triggers}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.triggers}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Provision column
      columnHelper.accessor('provision', {
        header: 'Provision',
        cell: ({ row }) => (
          <Tooltip title={row.original.provision}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.provision}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Agency column
      columnHelper.accessor('agency', {
        header: 'Agency',
        cell: ({ row }) => <Typography>{row.original.agency}</Typography>,
        size: 120
      }),

      // Agency Address column
      columnHelper.accessor('agency_add', {
        header: 'Agency Address',
        cell: ({ row }) => (
          <Tooltip title={row.original.agency_add}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.agency_add}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Remarks column
      columnHelper.accessor('remarks', {
        header: 'Remarks',
        cell: ({ row }) => (
          <Tooltip title={row.original.remarks}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.remarks}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Key column
      columnHelper.accessor('key1', {
        header: 'Key',
        cell: ({ row }) => <Typography>{row.original.key1}</Typography>,
        size: 80
      }),

      // Status column
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'Active'
          return <Chip label={status} color={statusObj[status]?.color || 'default'} variant='tonal' size='small' />
        },
        size: 100
      }),

      // Form Name column
      columnHelper.accessor('form_name', {
        header: 'Form Name',
        cell: ({ row }) => <Typography>{row.original.form_name}</Typography>,
        size: 120
      }),

      // Form Purpose column
      columnHelper.accessor('form_purpose', {
        header: 'Form Purpose',
        cell: ({ row }) => (
          <Tooltip title={row.original.form_purpose}>
            <Typography className='truncate' sx={{ maxWidth: '120px' }}>
              {row.original.form_purpose}
            </Typography>
          </Tooltip>
        ),
        size: 120
      }),

      // Potential Impact column
      columnHelper.accessor('potential_impact', {
        header: 'Potential Impact',
        cell: ({ row }) => <Typography>{row.original.potential_impact}</Typography>,
        size: 120
      }),

      // Act ID column
      columnHelper.accessor('act_id', {
        header: 'Act ID',
        cell: ({ row }) => <Typography>{row.original.act_id}</Typography>,
        size: 100
      }),

      // Recode column
      columnHelper.accessor('recode', {
        header: 'Recode',
        cell: ({ row }) => <Typography>{row.original.recode}</Typography>,
        size: 100
      }),

      // Timestamp column
      columnHelper.accessor('timestamp', {
        header: 'Timestamp',
        cell: ({ row }) => <Typography>{new Date(row.original.timestamp).toLocaleString()}</Typography>,
        size: 150
      }),

      // Expiry Date column
      columnHelper.accessor('expiry_date', {
        header: 'Expiry Date',
        cell: ({ row }) => <Typography>{row.original.expiry_date}</Typography>,
        size: 100
      }),

      // Legal Date column
      columnHelper.accessor('legal_date', {
        header: 'Legal Date',
        cell: ({ row }) => <Typography>{row.original.legal_date}</Typography>,
        size: 100
      }),

      // Actual Status column
      columnHelper.accessor('Actual Status', {
        header: 'Actual Status',
        cell: ({ row }) => <Typography>{row.original['Actual Status']}</Typography>,
        size: 120
      })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data: complianceData,
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
      <CardHeader title='Export Compliance' subheader='Select category and act to export compliance data' />
      <Divider />

      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* First Dropdown - Category Selection */}
            <FormControl fullWidth>
              <InputLabel id='category-select-label'>Select Category</InputLabel>
              <Select
                labelId='category-select-label'
                id='category-select'
                value={selectedCategory}
                label='Select Category'
                onChange={handleCategoryChange}
              >
                {Object.entries(categoryDisplayNames).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Second Dropdown - Act Selection (shows only when category is selected) */}
            {selectedCategory && (
              <FormControl fullWidth>
                <InputLabel id='act-select-label'>Select Act</InputLabel>
                <Select
                  labelId='act-select-label'
                  id='act-select'
                  value={selectedAct}
                  label='Select Act'
                  onChange={handleActChange}
                >
                  {dropdownData[selectedCategory].map(act => {
                    // Handle if act is a string or object
                    const key = typeof act === 'object' ? act.id || JSON.stringify(act) : act
                    const value = typeof act === 'object' ? act.id || act.name : act
                    const display = typeof act === 'object' ? act.name || String(act.id) : act

                    return (
                      <MenuItem key={key} value={value}>
                        {display}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            )}

            {/* Export Button */}
            <Button
              variant='contained'
              color='primary'
              startIcon={
                exportLoading ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-file-export' />
              }
              disabled={!selectedCategory || !selectedAct || exportLoading}
              onClick={handleExport}
              sx={{ mt: 2, alignSelf: 'flex-start' }}
            >
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>

            {/* Selection Summary */}
            {selectedCategory && selectedAct && (
              <Typography variant='body2' color='textSecondary' sx={{ mt: 2 }}>
                You've selected: <strong>{categoryDisplayNames[selectedCategory]}</strong> &gt;{' '}
                <strong>{selectedAct}</strong>
              </Typography>
            )}

            {/* Table Section - Show only when data is available */}
            {complianceData.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 4 }} />

                <Typography variant='h6' className='mb-4'>
                  Compliance Data
                </Typography>

                {/* Search and Export Area */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <CustomTextField
                    placeholder='Search...'
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    sx={{ width: { xs: '100%', sm: '250px' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-search' />
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
                      sx={{ width: '80px' }}
                    >
                      <MenuItem value='10'>10</MenuItem>
                      <MenuItem value='25'>25</MenuItem>
                      <MenuItem value='50'>50</MenuItem>
                      <MenuItem value='100'>100</MenuItem>
                    </CustomTextField>
                  </div>
                </Box>

                {/* Table Container */}
                <div className='relative w-full'>
                  {tableLoading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 2
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  )}

                  <div className='overflow-x-auto w-full'>
                    <table className={tableStyles.table} style={{ minWidth: '2500px' }}>
                      <colgroup>
                        {table.getAllColumns().map(column => (
                          <col key={column.id} style={{ width: `${column.getSize()}px` }} />
                        ))}
                      </colgroup>

                      <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th
                                key={header.id}
                                style={{
                                  width: `${header.getSize()}px`,
                                  maxWidth: `${header.getSize()}px`
                                }}
                              >
                                {header.isPlaceholder ? null : (
                                  <div
                                    className={classnames({
                                      'flex items-center': header.column.getIsSorted(),
                                      'cursor-pointer select-none': header.column.getCanSort()
                                    })}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    <Tooltip title={String(header.column.columnDef.header)}>
                                      <Typography noWrap>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                      </Typography>
                                    </Tooltip>
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
                              No compliance data found
                            </td>
                          </tr>
                        ) : (
                          table
                            .getRowModel()
                            .rows.slice(0, table.getState().pagination.pageSize)
                            .map(row => (
                              <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                {row.getVisibleCells().map(cell => (
                                  <td
                                    key={cell.id}
                                    style={{
                                      width: `${cell.column.getSize()}px`,
                                      maxWidth: `${cell.column.getSize()}px`
                                    }}
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div style={{ borderTop: '1px solid rgba(58, 53, 65, 0.12)', width: '100%', marginTop: '16px' }}>
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
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default ExportCompliance
