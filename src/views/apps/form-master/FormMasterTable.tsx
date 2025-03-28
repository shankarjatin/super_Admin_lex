'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
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
import axios from 'axios'
import https from 'https'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

type FormDataType = {
  id: string
  formName: string
  actId: string
  actName: string
  downloadUrl?: string
  formUrl?: string
  status: string
  isDeleted: string
}

type StatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const statusObj: StatusType = {
  Active: { title: 'Active', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' },
  Draft: { title: 'Draft', color: 'warning' },
  Pending: { title: 'Pending', color: 'info' }
}

// Column Definitions
const columnHelper = createColumnHelper<FormDataType>()

interface FormMasterTableProps {
  data: FormDataType[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRefresh?: () => void
}

const FormMasterTable = ({ data, onEdit, onDelete, onRefresh }: FormMasterTableProps) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [filteredData, setFilteredData] = useState<FormDataType[]>(data || [])

  // Update filtered data when props data changes
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setFilteredData(data)
    }
  }, [data])

  // Handle form deletion
  const handleDeleteForm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        console.log('Deleting form with ID:', id)

        const response = await axiosInstance.post(
          'https://ai.lexcomply.co/v2/api/formMaster/removeForm',
          { id },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('Delete form response:', response.data)

        if (response.data && response.data.success) {
          // Remove from local state
          setFilteredData(filteredData.filter(form => form.id !== id))

          // Notify parent component if callback provided
          if (onDelete) onDelete(id)

          alert('Form deleted successfully')

          // Refresh data if callback provided
          if (onRefresh) onRefresh()
        } else {
          alert('Failed to delete form')
        }
      } catch (error) {
        console.error('Error deleting form:', error)
        alert('Error deleting form. Please try again.')
      }
    }
  }

  const columns = useMemo<ColumnDef<FormDataType, any>[]>(
    () => [
      // Sr. No.
      columnHelper.accessor('id', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      }),

      // Form Name
      columnHelper.accessor('formName', {
        header: 'Form Name',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.formName}</Typography>
      }),

      // Act Name
      columnHelper.accessor('actName', {
        header: 'Act Name',
        cell: ({ row }) => <Typography>{row.original.actName}</Typography>
      }),

      // Download Links
      columnHelper.accessor('downloadUrl', {
        header: 'Download Links',
        cell: ({ row }) => {
          const downloadUrl = row.original.downloadUrl || row.original.formUrl

          return downloadUrl ? (
            <Link href={downloadUrl} target='_blank' download className='flex items-center text-primary'>
              <i className='tabler-download mr-2' />
              Download Form
            </Link>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              No download available
            </Typography>
          )
        }
      }),

      // Status
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'Inactive'
          const statusInfo = statusObj[status] || { title: status, color: 'default' as ThemeColor }

          return <Chip label={statusInfo.title} variant='tonal' color={statusInfo.color} size='small' />
        }
      }),

      // Edit
      columnHelper.accessor('edit', {
        header: 'Edit',
        cell: ({ row }) => (
          <IconButton color='primary' onClick={() => onEdit && onEdit(row.original.id)}>
            <i className='tabler-edit' />
          </IconButton>
        ),
        enableSorting: false
      }),

      // Delete
      columnHelper.accessor('delete', {
        header: 'Delete',
        cell: ({ row }) => (
          <IconButton color='error' onClick={() => handleDeleteForm(row.original.id)}>
            <i className='tabler-trash' />
          </IconButton>
        ),
        enableSorting: false
      })
    ],
    [onEdit, filteredData]
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
    <>
      <div className='flex justify-between items-center mb-4'>
        <Typography variant='h6'>Forms ({filteredData.length})</Typography>
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
                  <Typography className='py-4'>No forms available</Typography>
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
    </>
  )
}

export default FormMasterTable
