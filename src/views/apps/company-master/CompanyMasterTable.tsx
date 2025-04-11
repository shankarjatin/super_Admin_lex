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

// Column Definitions
const columnHelper = createColumnHelper<ComplianceDataType>()

const ComplianceTable = ({ data }: { data: ComplianceDataType[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

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
            <IconButton color='primary' size='small'>
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

      // Delete column
      columnHelper.accessor('actions', {
        header: 'Delete',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton color='error' size='small'>
              <i className='tabler-trash' />
            </IconButton>
          </Box>
        ),
        enableSorting: false,
        size: 60
      })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data: data || [],
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

  // Check if table is defined before rendering table-related elements
  const isTableDefined = !!table

  return (
    <div className='overflow-x-auto'>
      {/* Search and filters */}
      <div className='flex flex-wrap justify-between gap-4 p-6'>
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
          <CustomTextField
            select
            value={pageSize}
            onChange={e => {
              const size = Number(e.target.value)
              setPageSize(size)
              if (isTableDefined) {
                table.setPageSize(size)
              }
            }}
            className='is-[80px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
        </div>
      </div>

      <Divider />

      <table className={tableStyles.table} style={{ minWidth: '1400px' }}>
        {isTableDefined && (
          <colgroup>
            {table.getAllColumns().map(column => (
              <col key={column.id} style={{ width: `${column.getSize()}px` }} />
            ))}
          </colgroup>
        )}

        <thead>
          {isTableDefined &&
            table.getHeaderGroups().map(headerGroup => (
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
          {!isTableDefined || table.getFilteredRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={15} className='text-center p-4'>
                <Typography>No data available</Typography>
              </td>
            </tr>
          ) : (
            table
              .getRowModel()
              .rows.slice(0, pageSize)
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

      {/* Pagination */}
      {isTableDefined && (
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
      )}
    </div>
  )
}

export default ComplianceTable
