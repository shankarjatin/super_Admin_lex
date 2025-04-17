'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CustomTextField from '@core/components/mui/TextField'
import Divider from '@mui/material/Divider'
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
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import axios from 'axios'
import https from 'https'

// Component Imports
import TablePaginationComponent from '../../../components/TablePaginationComponent'
import CustomAutocomplete from '@core/components/mui/Autocomplete'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for the dropdown API response
interface ActOption {
  id: number
  actId: number
  name: string
  type?: string
}

// Define the type for event data
interface EventData {
  id: string
  event_name: string
}

// Column Definitions
const columnHelper = createColumnHelper<EventData>()

const ShowActEvent = () => {
  // States for dropdown
  const [options, setOptions] = useState<ActOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [selectedAct, setSelectedAct] = useState<ActOption | null>(null)

  // States for event data
  const [eventData, setEventData] = useState<EventData[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Table states
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [pageSize, setPageSize] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Fetch dropdown options from the API
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

        if (response.data) {
          console.log('Dropdown options loaded:', response.data.length, 'items')
          setOptions(response.data)
        } else {
          setOptions([])
          setError('No dropdown data received from server')
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        setOptions([])
        setError('Failed to load acts. Please try again later.')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Function to fetch event data when an act is selected
  const fetchEventData = async (actId: number) => {
    try {
      setLoadingEvents(true)
      setError(null)

      console.log(`Fetching events for act ID: ${actId}`)

      const response = await axiosInstance.get(
        `https://ai.lexcomply.co/v2/api/eventMaster/getEventCompliance?actId=${actId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && Array.isArray(response.data)) {
        console.log('Event data loaded:', response.data)
        setEventData(response.data)
      } else {
        console.log('No event data found or invalid format')
        setEventData([])
      }
    } catch (error) {
      console.error('Error fetching event data:', error)
      setError('Failed to load event data. Please try again later.')
      setEventData([])
    } finally {
      setLoadingEvents(false)
    }
  }

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (selectedAct?.id) {
        await fetchEventData(selectedAct.id)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle act selection from dropdown
  const handleActChange = (event: any, newValue: ActOption | null) => {
    setSelectedAct(newValue)
    if (newValue && newValue.id) {
      fetchEventData(newValue.id)
    } else {
      setEventData([])
    }
  }

  // Define columns for the table
  const columns = useMemo<ColumnDef<EventData, any>[]>(
    () => [
      // Sr. No. Column
      columnHelper.accessor('id', {
        header: 'Sr. No.',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 80
      }),

      // Event Column
      columnHelper.accessor('event_name', {
        header: 'Event',
        cell: ({ row }) => (
          <Tooltip title={row.original.event_name || 'N/A'}>
            <Typography color='text.primary' className='truncate' sx={{ maxWidth: '300px' }}>
              {row.original.event_name || 'N/A'}
            </Typography>
          </Tooltip>
        )
      })
    ],
    []
  )

  // Create the table instance
  const table = useReactTable({
    data: eventData,
    columns,
    state: {
      globalFilter,
      pagination: {
        pageSize,
        pageIndex: 0
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader
        title='Act Events'
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': { fontSize: '1.25rem' }
        }}
      />

      {/* Autocomplete dropdown for acts */}
      <div className='w-full px-6 py-4'>
        <CustomAutocomplete
          fullWidth
          options={options}
          value={selectedAct}
          loading={loadingOptions}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue)
          }}
          onChange={handleActChange}
          id='autocomplete-acts'
          getOptionLabel={option => option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => (
            <CustomTextField
              {...params}
              label='Search Acts'
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
      </div>

      <Divider />

      {/* Search Area */}
      <div className='flex justify-between items-center px-6 py-3'>
        <CustomTextField
          placeholder='Search events...'
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
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
            <IconButton onClick={handleRefresh} disabled={isRefreshing || loadingEvents || !selectedAct}>
              {isRefreshing || loadingEvents ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
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

      <Divider />

      {/* Show error message if there's an error */}
      {error && (
        <Alert severity='error' sx={{ mx: 6, my: 2 }}>
          {error}
        </Alert>
      )}

      {/* Show loading indicator while fetching data */}
      {loadingEvents && (
        <div className='flex justify-center py-8'>
          <CircularProgress size={40} />
        </div>
      )}

      {/* Show message when no act is selected */}
      {!loadingEvents && !selectedAct && !error && (
        <div className='text-center py-8 text-textSecondary'>
          Please select an act from the dropdown to view events.
        </div>
      )}

      {/* Show message when no data is available for selected act */}
      {!loadingEvents && selectedAct && eventData.length === 0 && !error && (
        <div className='text-center py-8 text-textSecondary'>No events found for the selected act.</div>
      )}

      {/* Table */}
      {!loadingEvents && eventData.length > 0 && (
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
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loadingEvents && eventData.length > 0 && (
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
          }}
        />
      )}
    </Card>
  )
}

export default ShowActEvent
