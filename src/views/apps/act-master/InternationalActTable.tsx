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
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Create axios instance for API calls
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define types
interface InternationalActOption {
  id: number
  actId: number
  name: string
  type?: string
}

type InternationalActDataType = {
  id: string
  act_id?: string
  name: string
  category: string
  continent: string
  country: string
  state: string
  city: string
  region: string
  isDeleted?: string
  description: string
  actDescription?: string
  actName?: string
}

// Column Definitions
const columnHelper = createColumnHelper<InternationalActDataType>()

const InternationalActTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState<InternationalActDataType[]>([])

  // Dropdown states
  const [options, setOptions] = useState<InternationalActOption[]>([])
  const [selectedAct, setSelectedAct] = useState<InternationalActOption | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Loading and error states
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dropdown options for international acts
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

        if (response.data && Array.isArray(response.data)) {
          setOptions(response.data)
        } else {
          throw new Error('Invalid dropdown data format')
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        setError('Failed to load acts. Please try again later.')
        setOptions([])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Handle input change for search
  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue)
  }

  // Handle act selection from dropdown
  const handleActChange = async (event: any, newValue: InternationalActOption | null) => {
    setSelectedAct(newValue)

    if (newValue && newValue.id) {
      await fetchActDetails(newValue.id)
    } else {
      setData([])
    }
  }

  // Fetch act details when an act is selected
  const fetchActDetails = async (actId: number) => {
    try {
      setDetailsLoading(true)
      setError(null)

      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/actMaster/getInternationalAct?id=${actId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Transform the API response to match our table data structure
        const formattedData = response.data.map((act: any) => ({
          id: act.id || act.act_id || String(act.actId) || '',
          name: act.actName || act.name || '',
          description: act.actDescription || act.description || '',
          country: act.country || 'Global',
          state: act.state || '',
          city: act.city || '',
          category: act.category || '',
          continent: act.continent || '',
          region: act.region || ''
        }))

        setData(formattedData)
      } else {
        setData([])
        setError('No details found for the selected act.')
      }
    } catch (error) {
      console.error('Error fetching act details:', error)
      setData([])
      setError('Failed to load act details. Please try again later.')
    } finally {
      setDetailsLoading(false)
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
        placeholder='Search acts...'
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

  // Define columns
  const columns = useMemo<ColumnDef<InternationalActDataType, any>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 50
      }),
      columnHelper.accessor('id', {
        id: 'act_id',
        header: "Int'l ID",
        cell: ({ row }) => (
          <Tooltip title={row.original.id}>
            <Typography className='truncate' sx={{ maxWidth: '70px' }}>
              {row.original.id}
            </Typography>
          </Tooltip>
        ),
        size: 70
      }),
      columnHelper.accessor('name', {
        header: 'Act Name',
        cell: ({ row }) => (
          <Tooltip title={row.original.name}>
            <Typography className='truncate font-medium' sx={{ maxWidth: '150px' }}>
              {row.original.name}
            </Typography>
          </Tooltip>
        ),
        size: 150
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.description}>
            <Typography className='truncate' sx={{ maxWidth: '200px' }}>
              {row.original.description || 'No description'}
            </Typography>
          </Tooltip>
        ),
        size: 200
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ row }) => (
          <Tooltip title={row.original.category}>
            <Typography className='truncate' sx={{ maxWidth: '100px' }}>
              {row.original.category || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 100
      }),
      columnHelper.accessor('country', {
        header: 'Country',
        cell: ({ row }) => (
          <Tooltip title={row.original.country}>
            <Typography className='truncate' sx={{ maxWidth: '100px' }}>
              {row.original.country || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 100
      }),
      columnHelper.accessor('continent', {
        header: 'Continent',
        cell: ({ row }) => (
          <Tooltip title={row.original.continent}>
            <Typography className='truncate' sx={{ maxWidth: '100px' }}>
              {row.original.continent || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 100
      }),
      columnHelper.accessor('state', {
        header: 'State',
        cell: ({ row }) => (
          <Tooltip title={row.original.state}>
            <Typography className='truncate' sx={{ maxWidth: '100px' }}>
              {row.original.state || '-'}
            </Typography>
          </Tooltip>
        ),
        size: 100
      }),
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
                  menuItemProps: { onClick: () => console.log('View', row.original.id) }
                },
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: { onClick: () => console.log('Edit', row.original.id) }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: { onClick: () => console.log('Delete', row.original.id) }
                }
              ]}
            />
          </Box>
        ),
        enableSorting: false,
        size: 80
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
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // Filter data based on globalFilter
  useEffect(() => {
    if (globalFilter) {
      const filtered = data.filter(
        item =>
          item.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.country?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.category?.toLowerCase().includes(globalFilter.toLowerCase())
      )
      table.setGlobalFilter(globalFilter)
    } else {
      table.setGlobalFilter('')
    }
  }, [globalFilter, data, table])

  return (
    <Card>
      <CardHeader title='International Acts' />

      <div className='flex flex-col gap-6 px-4 py-4'>
        {/* Error message */}
        {error && (
          <Alert severity='error' sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Autocomplete dropdown */}
        <CustomAutocomplete
          fullWidth
          options={options}
          value={selectedAct}
          loading={loadingOptions}
          inputValue={inputValue}
          onInputChange={handleInputChange}
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

        {/* Loading indicator for details */}
        {detailsLoading && (
          <div className='flex justify-center py-4'>
            <CircularProgress />
          </div>
        )}

        {/* Message when no act is selected */}
        {!detailsLoading && data.length === 0 && !error && (
          <div className='text-center py-8 text-textSecondary'>
            Please select an act from the dropdown to view details.
          </div>
        )}
      </div>

      {/* Show table only when data is loaded */}
      {!detailsLoading && data.length > 0 && (
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

          <table className={tableStyles.table} style={{ minWidth: '950px' }}>
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
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Typography>No international acts available</Typography>
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
    </Card>
  )
}

export default InternationalActTable
