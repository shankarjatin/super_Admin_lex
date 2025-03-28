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
import Link from '@mui/material/Link'

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
import axios from 'axios'
import https from 'https'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

type DocumentType = {
  id: string
  name?: string
  documentName?: string
  documentTitle?: string
  status?: string
  documentUrl?: string
  dateTime?: string
  act_id?: number
  compliance_id?: number
  productName?: string
  description?: string
  country?: string
  state?: string
  city?: string
  category?: string
  continent?: string
  region?: string
  type?: string
  subject?: string
  scope?: string
  price?: number
  complianceCount?: number
  sku?: string
  stock?: boolean
  qty?: number
}

type DocumentWithActionsType = DocumentType & {
  actions?: string
}

type documentStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const documentStatusObj: documentStatusType = {
  Active: { title: 'Active', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<DocumentWithActionsType>()

const DocumentMasterTable = ({ productData }: { productData?: DocumentType[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [data, setData] = useState(productData || [])

  const handleDeleteDocument = async (id: string) => {
    // Confirm before deletion
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        console.log(`Deleting document with ID: ${id}`)

        // Make the API call to delete the document
        const response = await axiosInstance.post(
          'https://ai.lexcomply.co/v2/api/documentMaster/removeDocument',
          { id },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('Delete API response:', response.data)

        // If deletion was successful, update the UI
        if (response.data) {
          // Remove the deleted item from the data
          setData(data?.filter(doc => doc.id !== id))

          // Show success message
          alert('Document deleted successfully')
        } else {
          alert('Failed to delete document')
        }
      } catch (error) {
        console.error('Error deleting document:', error)
        alert('Error deleting document. Please try again.')
      }
    }
  }

  const columns = useMemo<ColumnDef<DocumentWithActionsType, any>[]>(
    () => [
      // Serial Number Column
      columnHelper.accessor('id', {
        header: 'SNO',
        cell: ({ row }) => <Typography>{parseInt(row.index) + 1}</Typography>
      }),
      // Document Name Column
      columnHelper.accessor('documentName', {
        header: 'Document',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' fontWeight={500}>
              {row.original.documentName || row.original.name || row.original.productName || 'Untitled'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {row.original.documentTitle || row.original.description || ''}
            </Typography>
          </div>
        )
      }),
      // View Document Column
      columnHelper.accessor('documentUrl', {
        header: 'View',
        cell: ({ row }) => {
          const url = row.original.documentUrl
          const baseUrl = 'https://ai.lexcomply.co/v2/api/'
          const fullUrl = url ? baseUrl + url : '#'

          return (
            <Link
              href={fullUrl}
              target='_blank'
              rel='noopener'
              underline='hover'
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: url ? 'primary.main' : 'text.disabled'
              }}
            >
              <i className='tabler-file-text me-2' />
              View Document
            </Link>
          )
        }
      }),
      // Date Column
      columnHelper.accessor('dateTime', {
        header: 'Date',
        cell: ({ row }) => {
          const dateTime = row.original.dateTime
          let formattedDate = dateTime

          // Format date if it's valid
          if (dateTime && dateTime !== 'Not available') {
            try {
              const date = new Date(dateTime)
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              }
            } catch (e) {
              console.error('Invalid date format:', dateTime)
            }
          }

          return <Typography>{formattedDate || 'N/A'}</Typography>
        }
      }),
      // Edit Column
      columnHelper.accessor('edit', {
        header: 'Edit',
        cell: ({ row }) => (
          <IconButton
            onClick={() => {
              console.log('Edit document:', row.original)
              // Implement edit functionality here
            }}
          >
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
        )
      }),
      // Delete Column
      columnHelper.accessor('delete', {
        header: 'Delete',
        cell: ({ row }) => (
          <IconButton onClick={() => handleDeleteDocument(row.original.id)} color='error'>
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
        )
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
        <CardHeader title='Document List' sx={{ '& .MuiCardHeader-action': { m: 0 } }} />
        <div className='flex justify-between items-center p-6'>
          <Typography variant='h6'>{data.length} Documents</Typography>
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
                    No documents available
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
    </>
  )
}

export default DocumentMasterTable
