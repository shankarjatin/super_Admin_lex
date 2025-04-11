'use client'

// React Imports
import { useMemo, useState, ChangeEvent } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import InputAdornment from '@mui/material/InputAdornment'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'

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
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import OptionMenu from '@/@core/components/option-menu'

// Define the state data type
type StateDataType = {
  id: string
  name: string
  short_name: string
  status: string | number | boolean
  isDeleted?: string
}

type StatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const statusObj: StatusType = {
  Active: { title: 'Active', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<StateDataType>()

interface StatesMasterTableProps {
  data: StateDataType[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRefresh?: () => void
  onStatusChange?: (id: string, newStatus: boolean) => Promise<void>
}

const StatesMasterTable = ({ data, onEdit, onDelete, onRefresh, onStatusChange }: StatesMasterTableProps) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [stateToDelete, setStateToDelete] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)

  // Format status consistently
  const formatStatus = (status: string | number | boolean): string => {
    if (status === 1 || status === '1' || status === true || status === 'Active') {
      return 'Active'
    }
    return 'Inactive'
  }

  // Handle status toggle
  const handleStatusToggle = async (id: string, currentStatus: string | number | boolean) => {
    if (!onStatusChange) return

    try {
      setStatusUpdating(id)
      const newStatus = !['1', 1, true, 'Active'].includes(currentStatus)
      await onStatusChange(id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setStatusUpdating(null)
    }
  }

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

  // Handle delete confirmation dialog
  const handleDeleteClick = (id: string) => {
    setStateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (stateToDelete && onDelete) {
      onDelete(stateToDelete)
      setDeleteDialogOpen(false)
      setStateToDelete(null)
    }
  }

  // Table columns definition
  const columns = useMemo<ColumnDef<StateDataType, any>[]>(
    () => [
      // Sr. No.
      columnHelper.accessor('id', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      }),

      // State Name
      columnHelper.accessor('name', {
        header: 'State Name',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.name}</Typography>
      }),

      // State Short Name
      columnHelper.accessor('short_name', {
        header: 'State Short Name',
        cell: ({ row }) => <Typography>{row.original.short_name}</Typography>
      }),

      // Status
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = formatStatus(row.original.status)
          const statusInfo = statusObj[status] || { title: status, color: 'default' as ThemeColor }
          const isUpdating = statusUpdating === row.original.id

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={statusInfo.title} variant='tonal' color={statusInfo.color} size='small' />
              {onStatusChange && (
                <Tooltip title={`Toggle status to ${status === 'Active' ? 'Inactive' : 'Active'}`}>
                  <span>
                    <Switch
                      size='small'
                      disabled={isUpdating}
                      checked={status === 'Active'}
                      onChange={() => handleStatusToggle(row.original.id, row.original.status)}
                      sx={{ ml: 1 }}
                    />
                    {isUpdating && <CircularProgress size={16} sx={{ ml: 1 }} />}
                  </span>
                </Tooltip>
              )}
            </Box>
          )
        }
      }),

      // Action Buttons
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View Details',
                  icon: 'tabler-eye',
                  menuItemProps: { onClick: () => console.log('View details', row.original.id) }
                },
                {
                  text: 'Edit State',
                  icon: 'tabler-edit',
                  menuItemProps: {
                    onClick: () => onEdit && onEdit(row.original.id)
                  }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteClick(row.original.id)
                  }
                }
              ]}
            />
          </Box>
        ),
        enableSorting: false,
        size: 80 // Fixed width for actions column
      })
    ],
    [onEdit, onDelete, statusUpdating]
  )

  // Configure table
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      columnFilters
    },
    initialState: {
      pagination: { pageSize }
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
    <div className='p-6'>
      <div className='flex flex-col sm:flex-row justify-between items-center mb-4 gap-3'>
        <Typography variant='h6'>States ({data.length})</Typography>

        <div className='flex items-center gap-3'>
          {/* Search field */}
          <CustomTextField
            placeholder='Search states...'
            value={globalFilter ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGlobalFilter(String(e.target.value))}
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

          {/* Refresh button */}
          {onRefresh && (
            <Tooltip title='Refresh states list'>
              <IconButton onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
              </IconButton>
            </Tooltip>
          )}

          {/* Page size selector */}
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
          </CustomTextField>
        </div>
      </div>

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
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  {globalFilter ? (
                    <Typography className='py-4'>No states found matching "{globalFilter}"</Typography>
                  ) : (
                    <Typography className='py-4'>No states available</Typography>
                  )}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>

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
          table.setPageIndex(0)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this state? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary' variant='tonal'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default StatesMasterTable
