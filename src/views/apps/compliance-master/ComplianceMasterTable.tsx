'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import CustomTextField from '@core/components/mui/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

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
import axios from 'axios'
import https from 'https'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AddExcel from '@/components/dialogs/compliance-master/addExcel'
import TransferCompliance from '@/components/dialogs/compliance-master/transfer'
import AddCompliance from '@/components/dialogs/compliance-master/addCompliance'
import ExportCompliance from './ExportCompliance'
import CopyCompliance from '@/components/dialogs/compliance-master/copyCompliane'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for the dropdown API response
interface InternationalActOption {
  id: number
  actId: number
  name: string
  type?: string
}

// Define the type for the act details API response
interface InternationalActDetails {
  id: string
  act_id: string
  category: string
  continent: string
  country: string
  state: string
  city: string
  region: string
  isDeleted: string
  actId: number
  actName: string
  actDescription: string
}

type ComplianceDataType = {
  id: string
  description: string
  scope?: string
  state?: string
  criticality?: string
  periodicity?: string
  website?: string
  history?: boolean
  expiry_date?: string
  due_date?: string
  edit?: boolean
  dormant?: boolean
  creation?: string
  effected?: string
  status?: string
  name?: string
  productName?: string
  country?: string
  city?: string
  category?: string
  continent?: string
  region?: string
  type?: string
  subject?: string
  price?: number
  complianceCount?: number
  sku?: string
  stock?: boolean
  qty?: number
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
  'On Event': { title: 'On Event', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<ComplianceDataType>()

const ComplianceMasterTable = () => {
  // API and data states
  const [options, setOptions] = useState<InternationalActOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [selectedAct, setSelectedAct] = useState<InternationalActOption | null>(null)
  const [actDetails, setActDetails] = useState<ComplianceDataType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Table states
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Dialog states
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [excelDialogOpen, setExcelDialogOpen] = useState<boolean>(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState<boolean>(false)
  const [exportComplianceOpen, setExportComplianceOpen] = useState<boolean>(false)
  const [copyComplianceOpen, setCopyComplianceOpen] = useState<boolean>(false)
  // Fetch dropdown options from the API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        setError(null)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/actMaster/getInternationalActDrop', {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = response.data // API response data
        console.log('Dropdown options loaded:', data.length, 'items')
        setOptions(data) // Update state with fetched data
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        setOptions([]) // Set empty array in case of error
        setError('Failed to load acts. Please try again later.')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Function to fetch act details when an act is selected
  const fetchActDetails = async (actId: number) => {
    try {
      setDetailsLoading(true)
      setError(null)

      console.log(`Fetching details for act ID: ${actId}`)

      // Use our custom axios instance to handle SSL issues
      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/actMaster/getInternationalAct?id=${actId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Map the API response to the format expected by the table component
        const formattedData = response.data.map((act: InternationalActDetails) => {
          return {
            id: act.id || act.act_id || String(act.actId) || '',
            name: act.actName || '',
            productName: act.actName || '',
            description: act.actDescription || '',
            country: act.country || 'Global',
            state: act.state || '',
            city: act.city || '',
            category: act.category || '',
            continent: act.continent || '',
            region: act.region || '',
            type: act.category === 'State' ? 'state' : 'central', // Default type based on category
            subject: '', // Not available in the response
            scope: act.state ? 'State' : 'National',
            status: 'Active', // Default status
            complianceCount: 0, // Not available in the response
            sku: 'SKU-' + act.id, // Required by ProductType
            stock: true, // Required by ProductType
            qty: 1 // Required by ProductType
          }
        })

        setActDetails(formattedData) // Set the formatted act details in state
      } else {
        setActDetails([]) // Clear act details in case of invalid data
        setError('No details found for the selected act.')
      }
    } catch (error) {
      console.error('Error fetching act details:', error)
      setActDetails([]) // Clear act details in case of error
      setError('Failed to load act details. Please try again later.')
    } finally {
      setDetailsLoading(false)
    }
  }

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (selectedAct?.id) {
        await fetchActDetails(selectedAct.id)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle act selection from dropdown
  const handleActChange = (event: any, newValue: InternationalActOption | null) => {
    if (newValue && newValue.id) {
      fetchActDetails(newValue.id)
    } else {
      setActDetails([])
    }
    setSelectedAct(newValue)
  }

  // Handle export action
  const handleExport = () => {
    if (selectedItemId) {
      // Implement export logic
      setExportDialogOpen(false)
      setSelectedItemId(null)
    }
  }

  // Add this handler for Excel upload success
  const handleExcelUploadSuccess = () => {
    handleRefresh()
  }

  // Define columns with the requested structure
  const columns = useMemo<ColumnDef<ComplianceDataType, any>[]>(
    () => [
      // S.No column
      columnHelper.accessor('id', {
        header: 'S.No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 60
      }),

      // ID column
      columnHelper.accessor('id', {
        id: 'id_column',
        header: 'ID',
        cell: ({ row }) => (
          <Tooltip title={row.original.id}>
            <Typography className='truncate' sx={{ maxWidth: '70px' }}>
              {row.original.id}
            </Typography>
          </Tooltip>
        ),
        size: 70
      }),

      // Description column
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.description}>
            <Typography className='truncate' sx={{ maxWidth: '180px' }}>
              {row.original.description || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 180
      }),

      // Rest of the columns remain the same
      columnHelper.accessor(row => row.scope || row.state || '', {
        id: 'scope_state',
        header: 'Scope/State',
        cell: ({ row }) => {
          const value = row.original.scope || row.original.state || '-'
          return (
            <Tooltip title={value}>
              <Typography className='truncate' sx={{ maxWidth: '100px' }}>
                {value}
              </Typography>
            </Tooltip>
          )
        },
        size: 100
      }),

      // Criticality column
      columnHelper.accessor('criticality', {
        header: 'Criticality',
        cell: ({ row }) => {
          const criticality = row.original.criticality || 'Low'
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

      // Website column
      columnHelper.accessor('website', {
        header: 'Website',
        cell: ({ row }) => {
          const website = row.original.website
          return website ? (
            <Tooltip title={website}>
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline truncate block'
                style={{ maxWidth: '100px' }}
              >
                {website}
              </a>
            </Tooltip>
          ) : (
            <Typography className='text-textDisabled'>-</Typography>
          )
        },
        size: 100
      }),

      // Other columns remain the same...
      columnHelper.accessor('history', {
        header: 'History',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton color='primary' size='small'>
              <i className='tabler-history' />
            </IconButton>
          </Box>
        ),
        size: 70
      }),

      // Expiry Date column
      columnHelper.accessor('expiry_date', {
        header: 'Expiry Date',
        cell: ({ row }) => <Typography>{row.original.expiry_date || '-'}</Typography>,
        size: 100
      }),

      // Due Date column
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => <Typography>{row.original.due_date || '-'}</Typography>,
        size: 100
      }),

      // Edit column
      columnHelper.accessor('edit', {
        header: 'Edit',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton color='primary' size='small' onClick={() => console.log('Edit:', row.original.id)}>
              <i className='tabler-edit' />
            </IconButton>
          </Box>
        ),
        size: 60
      }),

      // Dormant column
      columnHelper.accessor('dormant', {
        header: 'Dormant',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Switch
              size='small'
              checked={row.original.dormant || false}
              onChange={() => console.log('Toggle dormant for ID:', row.original.id)}
            />
          </Box>
        ),
        size: 80
      }),

      // Creation column
      columnHelper.accessor('creation', {
        header: 'Creation',
        cell: ({ row }) => <Typography>{row.original.creation || '-'}</Typography>,
        size: 100
      }),

      // Effected column
      columnHelper.accessor('effected', {
        header: 'Effected',
        cell: ({ row }) => <Typography>{row.original.effected || '-'}</Typography>,
        size: 100
      }),

      // Actions column (with Edit and Export options)
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: { onClick: () => console.log('Edit', row.original.id) }
                },
                {
                  text: 'Export',
                  icon: 'tabler-download',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedItemId(row.original.id)
                      setExportDialogOpen(true)
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => console.log('Delete', row.original.id),
                    sx: { color: 'error.main' }
                  }
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

  // Create the table instance
  const table = useReactTable({
    data: actDetails,
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
    <>
      <Card>
        {/* Card Header with Action Buttons - Always visible at top */}
        <CardHeader
          title=''
          action={
            <div className='flex flex-wrap justify-end gap-4'>
              <Button
                variant='contained'
                className='max-sm:is-full is-auto'
                onClick={() => setOpenModal(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Add Compliance
              </Button>
              <Button
                variant='contained'
                className='max-sm:is-full is-auto'
                onClick={() => setExcelDialogOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Add Excel
              </Button>
              <Button
                variant='contained'
                className='max-sm:is-full is-auto'
                onClick={() => setTransferDialogOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Transfer Compliance
              </Button>
              <Button
                variant='contained'
                className='max-sm:is-full is-auto'
                onClick={() => setExportComplianceOpen(true)}
                startIcon={<i className='tabler-file-export' />}
                color='primary'
              >
                Export Compliance
              </Button>
              <Button
                variant='contained'
                className='max-sm:is-full is-auto'
                onClick={() => setCopyComplianceOpen(true)}
                startIcon={<i className='tabler-copy' />}
                color='secondary'
              >
                Copy Compliance
              </Button>
            </div>
          }
          sx={{
            flexDirection: ['column', 'row'],
            alignItems: ['flex-start', 'center'],
            '& .MuiCardHeader-action': {
              mb: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end'
            }
          }}
        />

        <Divider />

        {/* Show error message if there's an error */}
        {error && (
          <Alert severity='error' sx={{ mx: 4, my: 2 }}>
            {error}
          </Alert>
        )}

        {/* Autocomplete dropdown - Moved from page.tsx */}
        <div className='w-full px-6 py-4'>
          <CustomAutocomplete
            fullWidth
            options={options}
            value={selectedAct}
            loading={loadingOptions}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue)
            }}
            onChange={handleActChange}
            id='autocomplete-international-acts'
            getOptionLabel={option => option.name || ''}
            isOptionEqualToValue={(option, value) => option.actId === value.actId}
            renderInput={params => (
              <CustomTextField
                {...params}
                label='Search International Acts'
                placeholder='Start typing to search acts'
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

        {/* Search Area - Non-scrolling section */}
        <div style={{ padding: '16px 24px' }}>
          <div className='flex flex-wrap justify-between gap-4'>
            <CustomTextField
              placeholder='Search...'
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
                <IconButton onClick={handleRefresh} disabled={isRefreshing || detailsLoading}>
                  {isRefreshing || detailsLoading ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
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
        </div>

        <Divider />

        {/* Show loading indicator while fetching details */}
        {detailsLoading && (
          <div className='flex justify-center py-8'>
            <CircularProgress size={40} />
          </div>
        )}

        {/* Show message when no act is selected */}
        {!detailsLoading && actDetails.length === 0 && !error && (
          <div className='text-center py-8 text-textSecondary'>
            Please select an act from the dropdown to view details.
          </div>
        )}

        {/* Create a completely separate section for the scrollable table */}
        {!detailsLoading && actDetails.length > 0 && (
          <div style={{ position: 'relative', width: '100%' }}>
            {/* This is the scrollable container */}
            <div
              style={{
                overflowX: 'auto',
                width: '100%'
              }}
            >
              <table className={tableStyles.table} style={{ minWidth: '1500px' }}>
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
                            maxWidth: `${header.getSize()}px`,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            padding: '12px 16px'
                          }}
                        >
                          {/* Header content remains the same */}
                          {header.isPlaceholder ? null : (
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Tooltip title={String(header.column.columnDef.header)}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
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
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            style={{
                              width: `${cell.column.getSize()}px`,
                              maxWidth: `${cell.column.getSize()}px`,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fixed Pagination - Non-scrolling section */}
        {!detailsLoading && actDetails.length > 0 && (
          <div
            style={{
              borderTop: '1px solid rgba(58, 53, 65, 0.12)',
              width: '100%'
            }}
          >
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
      </Card>

      {/* Export Format Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Export Format</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 pt-4'>
            <Button
              variant={exportFormat === 'pdf' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('pdf')}
              fullWidth
            >
              PDF
            </Button>
            <Button
              variant={exportFormat === 'excel' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('excel')}
              fullWidth
            >
              Excel
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleExport} variant='contained'>
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Component Dialogs */}
      <AddExcel open={excelDialogOpen} setOpen={setExcelDialogOpen} onSuccess={handleExcelUploadSuccess} />
      <AddCompliance open={openModal} setOpen={setOpenModal} onSuccess={handleExcelUploadSuccess} />
      <TransferCompliance
        open={transferDialogOpen}
        setOpen={setTransferDialogOpen}
        onSuccess={handleExcelUploadSuccess}
      />
      <CopyCompliance open={copyComplianceOpen} setOpen={setCopyComplianceOpen} onSuccess={handleExcelUploadSuccess} />
      <Dialog
        open={exportComplianceOpen}
        onClose={() => setExportComplianceOpen(false)}
        maxWidth='xl'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle>
          Export Compliance
          <IconButton
            aria-label='close'
            onClick={() => setExportComplianceOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ExportCompliance />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ComplianceMasterTable
