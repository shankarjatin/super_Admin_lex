'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Locale } from '@configs/i18n'
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import axios from 'axios'

// Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://ai.lexcomply.co/v2/api',
  timeout: 10000
})

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import AddEditAct from '@/components/dialogs/add-act'

// Components
import InternationalActTable from './InternationalActTable'
import EditAct from '@/components/dialogs/edit-act'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ProductWithActionsType = ProductType & {
  actions?: string
  type?: string
  complianceCount?: number
  name?: string
  description?: string
  country?: string
  scope?: string
  subject?: string
}

type ProductCategoryType = {
  [key: string]: {
    icon: string
    color: ThemeColor
  }
}

type productStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Vars
const productCategoryObj: ProductCategoryType = {
  Accessories: { icon: 'tabler-headphones', color: 'error' },
  'Home Decor': { icon: 'tabler-smart-home', color: 'info' },
  Electronics: { icon: 'tabler-device-laptop', color: 'primary' },
  Shoes: { icon: 'tabler-shoe', color: 'success' },
  Office: { icon: 'tabler-briefcase', color: 'warning' },
  Games: { icon: 'tabler-device-gamepad-2', color: 'secondary' }
}

const productStatusObj: productStatusType = {
  Scheduled: { title: 'Scheduled', color: 'warning' },
  Published: { title: 'Publish', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<ProductWithActionsType>()

const ActListTable = ({ productData }: { productData?: ProductType[] }) => {
  // States
  // console.log(productData)
  const [rowSelection, setRowSelection] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [data, setData] = useState(productData || [])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingRowId, setEditingRowId] = useState(null)
  const [rowData, setRowData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Hooks
  const { lang: locale } = useParams()

  const fetchRowData = async id => {
    if (!id) {
      console.error('No act ID provided')
      return
    }

    setIsLoading(true)
    try {
      // Use axios instead of fetch for better error handling
      const response = await axiosInstance.get(`https://ai.lexcomply.co/v2/api/actMaster/getInternationalAct?id=${id}`)

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Format the data if needed to match your EditAct component's expectations
        const actData = response.data[0]
        console.log('API Response:', actData)

        // Set the data to pass to the modal
        setRowData(actData)

        // Set the editing ID which will open the modal (based on your existing logic)
        setEditingRowId(id)
      } else {
        console.error('Failed to fetch act details: No data returned')
      }
    } catch (error) {
      console.error('Error fetching act details:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleDeleteAct = async (id: string | number) => {
    // Confirm before deletion
    if (window.confirm('Are you sure you want to delete this act?')) {
      try {
        console.log(`Deleting act with ID: ${id}`)

        // Make the API call to delete the act
        const response = await axiosInstance.delete('https://ai.lexcomply.co/v2/api/actMaster/removeActMaster', {
          data: { id },
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('Delete API response:', response.data)

        // If deletion was successful, update the UI
        if (response.data) {
          // Remove the deleted item from the data
          setData(data?.filter(product => product.id !== id))
          setFilteredData(filteredData?.filter(product => product.id !== id))

          // Show success message
          alert('Act deleted successfully')
        } else {
          alert('Failed to delete act')
        }
      } catch (error) {
        console.error('Error deleting act:', error)
        alert('Error deleting act. Please try again.')
      }
    }
  }
  // Update data when productData changes
  useEffect(() => {
    if (productData) {
      setData(productData)
      setFilteredData(productData)
    }
  }, [productData])

  // Handlers
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const filtered = data.filter(item => item.type === category || category === '')
    setFilteredData(filtered)
  }

  // Define columns before using them in the table instance
  const columns = useMemo<ColumnDef<ProductWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>
      }),
      columnHelper.accessor('complianceCount', {
        header: 'COMPLIANCE COUNT',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <Typography color='text.primary'>{row.original.complianceCount || 0}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('type', {
        header: 'TYPE',
        cell: ({ row }) => <Typography>{row.original.type || 'General'}</Typography>
      }),
      columnHelper.accessor('name', {
        header: 'ACT NAME',
        cell: ({ row }) => (
          <Typography className='truncate max-w-[200px]' title={row.original.name}>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('description', {
        header: 'ACT DESCRIPTION',
        cell: ({ row }) => (
          <Typography className='truncate max-w-[200px]' title={row.original.description}>
            {row.original.description || 'No description'}
          </Typography>
        )
      }),
      columnHelper.accessor('country', {
        header: 'COUNTRY',
        cell: ({ row }) => <Typography>{row.original.country || 'Global'}</Typography>
      }),
      columnHelper.accessor('scope', {
        header: 'SCOPE',
        cell: ({ row }) => (
          <Typography sx={{ textTransform: 'capitalize' }}>{row.original.scope || 'National'}</Typography>
        )
      }),
      columnHelper.accessor('subject', {
        header: 'SUBJECT',
        cell: ({ row }) => <Typography>{row.original.subject || 'General'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'STATUS',
        cell: ({ row }) => {
          // Define the status styles object
          const statusObj = {
            Published: { title: 'Active', color: 'success' as ThemeColor },
            Inactive: { title: 'Inactive', color: 'error' as ThemeColor },
            Active: { title: 'Active', color: 'success' as ThemeColor },
            Scheduled: { title: 'Active', color: 'success' as ThemeColor },
            Draft: { title: 'Inactive', color: 'error' as ThemeColor }
          }

          const status = row.original.status

          // Determine if the status string contains certain keywords to categorize as Active/Inactive
          let mappedStatus: string

          if (typeof status === 'string') {
            if (['published', 'active', 'scheduled'].includes(status.toLowerCase())) {
              mappedStatus = 'Active'
            } else {
              mappedStatus = 'Inactive'
            }
          } else {
            // Default to showing the actual status text
            mappedStatus = status || 'Inactive'
          }

          // Get the styling info for this status
          const statusInfo = statusObj[mappedStatus] ||
            statusObj[status as keyof typeof statusObj] || {
              title: mappedStatus,
              color: mappedStatus === 'Active' ? 'success' : ('error' as ThemeColor)
            }

          return <Chip label={statusInfo.title} variant='tonal' color={statusInfo.color} size='small' />
        }
      }),
      columnHelper.accessor('actions', {
        header: 'ACTIONS',
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
                  menuItemProps: { onClick: () => console.log('View details', row.original.id) }
                },
                {
                  text: 'Edit Act',
                  icon: 'tabler-edit',
                  menuItemProps: {
                    onClick: () => fetchRowData(row.original.id)
                  }
                },

                // Replace the existing Delete option with this:
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteAct(row.original.id)
                  }
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

  // Create table instance AFTER columns definition
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      rowSelection
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter
    }
  })

  // Render the table content based on selected category
  const renderTableContent = () => {
    if (selectedCategory === 'Accessories') {
      // Show International Act Table (you'll need to implement this component)
      return <InternationalActTable data={filteredData} />
    } else {
      return (
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
      )
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Acts Master' />
        <TableFilters setData={setFilteredData} productData={data} onCategoryChange={handleCategoryChange} />
        <Divider />
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Acts'
            className='max-sm:is-full'
          />
          <div className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='flex-auto is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>

            <Button
              variant='contained'
              className='max-sm:is-full is-auto'
              onClick={() => setOpenModal(true)}
              startIcon={<i className='tabler-plus' />}
            >
              Add Act
            </Button>
          </div>
        </div>

        {/* Render table content */}
        {renderTableContent()}

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
      <AddEditAct open={openModal} setOpen={setOpenModal} />
      <EditAct
        open={!!editingRowId}
        setOpen={(open: boolean) => setEditingRowId(open ? editingRowId : null)}
        data={rowData}
      />
    </>
  )
}

export default ActListTable
