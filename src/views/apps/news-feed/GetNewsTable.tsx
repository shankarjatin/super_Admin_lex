'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'

// Third-party Imports
import classnames from 'classnames'
import axios from 'axios'
import https from 'https'
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

// Component Imports
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Button } from '@mui/material'
import AddIndianDossier from '@/components/dialogs/add-indian-dossier'
import MergeActName from '@/components/dialogs/add-indian-dossier/mergeActName'

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define types for news data
interface NewsDataType {
  sr: number
  company_id: string
  new_title: string
  discription: string
  department: string
  froms: string
  till: string
  status: number
  category: string
  user_role: string
  location: string
  timestamp: string
  link: string
  url: string
  s: number
  updatetime: string
  upload_by: string
  isDeleted: string
}

// Define type for dropdown options
interface DropdownOption {
  url: string
}

// Column Definitions
const columnHelper = createColumnHelper<NewsDataType>()

const GetNewsTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState<NewsDataType[]>([])

  // Dropdown states
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([])
  const [selectedUrl, setSelectedUrl] = useState<DropdownOption | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Loading and error states
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingNews, setLoadingNews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDossierDialog, setOpenDossierDialog] = useState(false)
  const [openInterDossierDialog, setOpenInterDossierDialog] = useState(false)
  const [mergeActName, setMergeActName] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  // Fetch dropdown options when component mounts
  useEffect(() => {
    const fetchDepartmentOptions = async () => {
      try {
        setLoadingOptions(true)
        setError(null)

        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/getRssDepartmentDrop')

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setDropdownOptions(response.data.data)
        } else {
          throw new Error('Invalid dropdown data format')
        }
      } catch (error) {
        console.error('Error fetching dropdown options:', error)
        setError('Failed to load department options. Please try again later.')
        setDropdownOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchDepartmentOptions()
  }, [])

  // Handle input change for dropdown
  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue)
  }

  // Fetch news data based on selected URL
  const fetchNewsData = async (url: string) => {
    try {
      setLoadingNews(true)
      setError(null)
      setData([]) // Clear previous data

      const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/getNews', {
        params: { url }
      })

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setData(response.data.data)
      } else {
        throw new Error('Invalid news data format or no data available')
      }
    } catch (error) {
      console.error('Error fetching news data:', error)
      setError('Failed to load news data. Please try again later.')
      setData([])
    } finally {
      setLoadingNews(false)
    }
  }

  // Handle selection from dropdown - automatically fetch data when URL is selected
  const handleUrlChange = async (event: any, newValue: DropdownOption | null) => {
    setSelectedUrl(newValue)

    if (newValue && newValue.url) {
      await fetchNewsData(newValue.url)
    }
  }

  // Function to handle debounced input for global filtering
  const DebouncedInput = ({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
  }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
      const timeout = setTimeout(() => {
        onChange(value)
      }, debounce)

      return () => clearTimeout(timeout)
    }, [value, onChange, debounce])

    return (
      <CustomTextField
        {...props}
        value={value}
        onChange={e => setValue(e.target.value)}
        fullWidth
        placeholder='Search news...'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <i className='tabler-search text-xl' />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={() => setValue('')}>
                <i className='tabler-x' />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
    )
  }

  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Define columns
  const columns = useMemo<ColumnDef<NewsDataType, any>[]>(
    () => [
      // Select column with checkbox
      columnHelper.display({
        id: 'select',
        header: () => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            size='small'
          />
        ),
        cell: ({ row }) => (
          <div className='px-1'>
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              indeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
              size='small'
            />
          </div>
        ),
        size: 60
      }),

      // News title column with download link
      columnHelper.accessor('new_title', {
        header: 'News title (Download link)',
        cell: ({ row }) => {
          const baseUrl = 'https://ai.lexcomply.co/'
          const downloadLink = row.original.link ? `${baseUrl}${row.original.link}` : null

          return (
            <Tooltip title={row.original.new_title}>
              <Typography className='truncate font-medium' sx={{ maxWidth: '250px' }}>
                {downloadLink ? (
                  <Link
                    href={downloadLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {row.original.new_title}
                    <i className='tabler-download text-sm' />
                  </Link>
                ) : (
                  row.original.new_title
                )}
              </Typography>
            </Tooltip>
          )
        },
        size: 250
      }),

      // News Description column
      columnHelper.accessor('discription', {
        header: 'News Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.discription}>
            <Typography className='truncate' sx={{ maxWidth: '300px' }}>
              {row.original.discription || 'No description available'}
            </Typography>
          </Tooltip>
        ),
        size: 300
      }),

      // Department column
      columnHelper.accessor('department', {
        header: 'Department',
        cell: ({ row }) => (
          <Tooltip title={row.original.department}>
            <Typography className='truncate' sx={{ maxWidth: '150px' }}>
              {row.original.department || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),

      // Date column
      columnHelper.accessor('timestamp', {
        header: 'Date',
        cell: ({ row }) => (
          <Chip label={formatDate(row.original.timestamp)} size='small' variant='tonal' color='primary' />
        ),
        size: 120
      })
    ],
    []
  )

  // Set up table
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination: {
        pageSize,
        pageIndex
      },
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader
        title='Indian Update - News'
        action={
          <div className='flex flex-wrap justify-end gap-4'>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setOpenDossierDialog(true)}
            >
              Add Indian Dossier
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setOpenInterDossierDialog(true)}
            >
              Add International Dossier
            </Button>
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setMergeActName(true)}>
              Rename/Merge Act Name
            </Button>
          </div>
        }
      />

      <div className='flex flex-col gap-4 p-6'>
        {/* Error message */}
        {error && (
          <Alert severity='error' sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        <div className='flex flex-wrap gap-4'>
          {/* Autocomplete dropdown - selecting from here automatically fetches data */}
          <CustomAutocomplete
            sx={{ flexGrow: 1 }}
            options={dropdownOptions}
            value={selectedUrl}
            loading={loadingOptions}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleUrlChange}
            id='autocomplete-news-urls'
            getOptionLabel={option => option.url || ''}
            isOptionEqualToValue={(option, value) => option.url === value.url}
            renderInput={params => (
              <CustomTextField
                {...params}
                label='Select URL'
                placeholder='Select URL to load news'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingOptions || loadingNews ? <CircularProgress color='inherit' size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </div>

        {/* Loading indicator for news data */}
        {loadingNews && (
          <div className='flex justify-center py-4'>
            <CircularProgress />
          </div>
        )}

        {/* Message when no URL is selected */}
        {!loadingNews && data.length === 0 && !error && (
          <div className='text-center py-8 text-textSecondary'>
            Please select a URL from the dropdown to view news data.
          </div>
        )}
      </div>

      {/* Show table only when data is loaded */}
      {!loadingNews && data.length > 0 && (
        <div className='overflow-x-auto'>
          <Divider />

          {/* Search and rows per page controls */}
          <div className='flex flex-wrap justify-between gap-4 p-6'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search in results'
              className='max-sm:is-full'
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
                className='is-[80px]'
              >
                <MenuItem value='10'>10</MenuItem>
                <MenuItem value='25'>25</MenuItem>
                <MenuItem value='50'>50</MenuItem>
                <MenuItem value='100'>100</MenuItem>
              </CustomTextField>
            </div>
          </div>

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

            <tbody>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Typography>No news data available</Typography>
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
      <AddIndianDossier
        open={openDossierDialog}
        setOpen={setOpenDossierDialog}
        via={0} // Specify 0 or 1 based on your requirements
        onSuccess={() => {
          // Refresh data if needed
          if (selectedUrl && selectedUrl.url) {
            fetchNewsData(selectedUrl.url)
          }
        }}
      />
      <MergeActName
        open={mergeActName}
        setOpen={setMergeActName}
        onSuccess={() => {
          // Refresh data if needed
          if (selectedUrl && selectedUrl.url) {
            fetchNewsData(selectedUrl.url)
          }
        }}
      />
      <AddIndianDossier
        open={openInterDossierDialog}
        setOpen={setOpenInterDossierDialog}
        via={1} // Specify 0 or 1 based on your requirements
        onSuccess={() => {
          // Refresh data if needed
          if (selectedUrl && selectedUrl.url) {
            fetchNewsData(selectedUrl.url)
          }
        }}
      />
    </Card>
  )
}

export default GetNewsTable
