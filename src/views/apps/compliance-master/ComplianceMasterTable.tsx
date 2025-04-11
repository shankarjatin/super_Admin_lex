'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Icon } from '@mui/material'
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

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AddExcel from '@/components/dialogs/compliance-master/addExcel'
import TransferCompliance from '@/components/dialogs/compliance-master/transfer'
import AddDocument from '@/components/dialogs/add-document'
import AddCompliance from '@/components/dialogs/compliance-master/addCompliance'

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

// Define interface for props
interface ComplianceMasterTableProps {
  data: ComplianceDataType[]
  onEdit?: (id: string) => void
  onExport?: (id: string) => void
  onRefresh?: () => void
  loading?: boolean
}

// Column Definitions
const columnHelper = createColumnHelper<ComplianceDataType>()

const ComplianceMasterTable = ({
  data = [],
  onEdit,
  onExport,
  onRefresh,
  loading = false
}: ComplianceMasterTableProps) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [excelDialogOpen, setExcelDialogOpen] = useState<boolean>(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState<boolean>(false)
  // Add this handler for Excel upload success
  const handleExcelUploadSuccess = () => {
    // Refresh data after successful upload
    if (onRefresh) {
      onRefresh()
    }
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

      // Scope/State column
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

      // History column
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
            <IconButton color='primary' size='small' onClick={() => onEdit && onEdit(row.original.id)}>
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
                  menuItemProps: { onClick: () => onEdit && onEdit(row.original.id) }
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
    [onEdit]
  )

  // Handle refresh button click
  const handleRefresh = async () => {
    if (!onRefresh) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle export action
  const handleExport = () => {
    if (selectedItemId && onExport) {
      onExport(selectedItemId)
      setExportDialogOpen(false)
      setSelectedItemId(null)
    }
  }

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
    <>
      <Card>
        {/* Fixed Header - Non-scrolling section */}

        <Divider />
        <div style={{ padding: '16px 24px' }}>
          <div className='flex flex-wrap justify-start gap-4'>
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
          </div>
        </div>
        {/* Fixed Search Area - Non-scrolling section */}
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
                <IconButton onClick={handleRefresh} disabled={isRefreshing || loading}>
                  {isRefreshing || loading ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
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

        {/* Create a completely separate section for the scrollable table */}
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
                {/* Table body content remains the same */}
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center p-4'>
                      <CircularProgress size={40} />
                    </td>
                  </tr>
                ) : table.getFilteredRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center p-4'>
                      <Typography>No data available</Typography>
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
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Pagination - Non-scrolling section */}
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
      </Card>

      {/* Export Format Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth='xs' fullWidth>
        {/* Dialog content remains the same */}
      </Dialog>
      <AddExcel open={excelDialogOpen} setOpen={setExcelDialogOpen} onSuccess={handleExcelUploadSuccess} />
      <AddCompliance open={openModal} setOpen={setOpenModal} onSuccess={handleExcelUploadSuccess} />
      <TransferCompliance
        open={transferDialogOpen}
        setOpen={setTransferDialogOpen}
        onSuccess={handleExcelUploadSuccess}
      />
    </>
  )
}

export default ComplianceMasterTable
