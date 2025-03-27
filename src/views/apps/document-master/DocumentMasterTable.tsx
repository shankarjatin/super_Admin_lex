'use client'

// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
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
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AddAdmin from '@/components/dialogs/add-admin'

type ProductWithActionsType = ProductType & {
  actions?: string
}

type productStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const productStatusObj: productStatusType = {
  Scheduled: { title: 'Scheduled', color: 'warning' },
  Published: { title: 'Publish', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<ProductWithActionsType>()

const DocumentMasterTable = ({ productData }: { productData?: ProductType[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [data, setData] = useState(productData || [])

  const columns = useMemo<ColumnDef<ProductWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('productName', {
        header: 'Id',
        cell: ({ row }) => <Typography>{row.original.qty}</Typography>
      }),
      columnHelper.accessor('category', {
        header: 'Compliance Count',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <Typography color='text.primary'>{row.original.category}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('sku', {
        header: 'Type',
        cell: ({ row }) => <Typography>{row.original.sku}</Typography>
      }),
      columnHelper.accessor('price', {
        header: 'Act name',
        cell: ({ row }) => <Typography>{row.original.price}</Typography>
      }),
      columnHelper.accessor('qty', {
        header: 'Act description',
        cell: ({ row }) => <Typography>{row.original.qty}</Typography>
      }),
      columnHelper.accessor('qty', {
        header: 'Country',
        cell: ({ row }) => <Typography>{row.original.qty}</Typography>
      }),
      columnHelper.accessor('qty', {
        header: 'Scope',
        cell: ({ row }) => <Typography>{row.original.qty}</Typography>
      }),
      columnHelper.accessor('qty', {
        header: 'Subject',
        cell: ({ row }) => <Typography>{row.original.qty}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={productStatusObj[row.original.status].title}
            variant='tonal'
            color={productStatusObj[row.original.status].color}
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
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: { onClick: () => setData(data.filter(product => product.id !== row.original.id)) }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 10
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
    <>
      <Card>
        <CardHeader
          title='Company Master'
          action={
            <Button variant='contained' onClick={() => setOpenModal(true)} startIcon={<i className='tabler-plus' />}>
              Add Admin
            </Button>
          }
        />
        <div className='flex justify-end p-6'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[80px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
        </div>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
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
                        </>
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
                    No data available
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
        </div>

        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <AddAdmin open={openModal} setOpen={setOpenModal} />
    </>
  )
}

export default DocumentMasterTable
