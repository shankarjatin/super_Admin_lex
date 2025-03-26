'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
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

// Type Imports
import type { ThemeColor } from '@core/types'
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type ProductWithActionsType = ProductType & {
  actions?: string
  region?: string
  compliance?: number
  country?: string
}

type InternationalStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const internationalStatusObj: InternationalStatusType = {
  Scheduled: { title: 'Scheduled', color: 'warning' },
  Published: { title: 'Published', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<ProductWithActionsType>()

const InternationalActTable = ({ data }: { data: ProductType[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [filteredData, setFilteredData] = useState<ProductType[]>(data)

  // Update filtered data when props data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const columns = useMemo<ColumnDef<ProductWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'International ID',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>
      }),
      columnHelper.accessor('productName', {
        header: 'Act Name',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.productName}</Typography>
      }),
      columnHelper.accessor('category', {
        header: 'Country',
        cell: ({ row }) => <Typography>{row.original.category}</Typography>
      }),
      columnHelper.accessor('region', {
        header: 'Region',
        cell: ({ row }) => <Typography>{row.original.region || 'Global'}</Typography>
      }),
      columnHelper.accessor('price', {
        header: 'Compliance Score',
        cell: ({ row }) => <Typography>{row.original.price}%</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            variant='tonal'
            color={internationalStatusObj[row.original.status]?.color || 'default'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View Details',
                  icon: 'tabler-eye',
                  menuItemProps: { onClick: () => console.log('View', row.original.id) }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: { onClick: () => console.log('Delete', row.original.id) }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      rowSelection,
      pagination: {
        pageSize,
        pageIndex
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
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
                <Typography>No international acts available</Typography>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {table
              .getRowModel()
              .rows.slice(0, table.getState().pagination.pageSize)
              .map(row => {
                return (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        )}
      </table>

      {/* <TablePagination
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
      /> */}
    </div>
  )
}

export default InternationalActTable
