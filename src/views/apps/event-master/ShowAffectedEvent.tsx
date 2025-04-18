'use client'

import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  gridPageCountSelector,
  useGridApiContext,
  useGridSelector,
  GridPagination,
  GridRenderCellParams
} from '@mui/x-data-grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Create https agent for API calls
const agent = new https.Agent({
  rejectUnauthorized: false
})

// Create axios instance for API calls
const axiosInstance = axios.create({
  baseURL: 'https://ai.lexcomply.co/v2/api',
  timeout: 10000,
  httpsAgent: agent
})

// Define interface for API parameters
interface ApiParams {
  page: number
  limit: number
  search?: string
}

// Define interfaces for the API response
interface ComplianceAct {
  act_id: number
  name: string
}

interface EventData {
  event: string
  compliance: ComplianceAct[]
}

interface ApiResponse {
  success: boolean
  statusCode: number
  message: string
  data: EventData[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: string
    pageSize: string
  }
  totalItems: number
}

// Define interface for event compliance detail modal
interface EventComplianceDetail {
  id: number
  period: string
  sub_head: string
  description: string
  criticality: string
  periodicity: string
  department: string
  status: string
  [key: string]: any // For any additional fields
}

// Row type for DataGrid
interface AffectedEventRow {
  id: number
  event: string
  compliance: ComplianceAct[]
}

// Define custom pagination component
function CustomPagination(props) {
  const apiRef = useGridApiContext()
  const page = useGridSelector(apiRef, state => state.pagination.page)
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        p: 2
      }}
    >
      <div>
        <IconButton onClick={() => apiRef.current.setPage(0)} disabled={page === 0}>
          <i className='tabler-chevron-left-pipe' />
        </IconButton>

        <IconButton onClick={() => apiRef.current.setPage(page - 1)} disabled={page === 0}>
          <i className='tabler-chevron-left' />
        </IconButton>

        <Typography variant='body2' component='span' sx={{ mx: 2 }}>
          Page {page + 1} of {pageCount || 1}
        </Typography>

        <IconButton onClick={() => apiRef.current.setPage(page + 1)} disabled={page >= pageCount - 1}>
          <i className='tabler-chevron-right' />
        </IconButton>

        <IconButton onClick={() => apiRef.current.setPage(pageCount - 1)} disabled={page >= pageCount - 1}>
          <i className='tabler-chevron-right-pipe' />
        </IconButton>
      </div>

      {/* Use the default rows per page selector */}
      <GridPagination {...props} />
    </Box>
  )
}

const ShowAffectedEvent = () => {
  // States for main data management
  const [rows, setRows] = useState<AffectedEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchValue, setSearchValue] = useState('')

  // State for API parameters
  const [apiParams, setApiParams] = useState<ApiParams>({
    page: 1,
    limit: 10
  })
  interface EventComplianceDetail {
    compliance_id: string
    compliance_description: string
    compliance_section: string
    compliance_rule: string
    compliance_sub_head: string
    compliance_criticality: string
  }

  // States for detailed modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<EventComplianceDetail[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [selectedAct, setSelectedAct] = useState<ComplianceAct | null>(null)

  // Force paginationModel to always sync with apiParams
  const paginationModel: GridPaginationModel = {
    page: apiParams.page - 1, // Convert 1-based to 0-based for DataGrid
    pageSize: apiParams.limit
  }

  // Fetch data from API with current parameters
  const fetchData = useCallback(async (params: ApiParams) => {
    setLoading(true)
    setError(null)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString()
      })

      // Only add search parameter if it exists
      if (params.search) {
        queryParams.append('search', params.search)
      }

      const response = await axiosInstance.get<ApiResponse>(
        `/eventMaster/getAllAffectedEventsActs?${queryParams.toString()}`
      )

      // Validate the API response
      if (!response.data || !response.data.data) {
        throw new Error('Invalid API response')
      }

      // Process the data for DataGrid
      const transformedRows = response.data.data.map((item, index) => ({
        id: index + 1 + (params.page - 1) * params.limit, // Generate unique IDs for each row
        event: item.event,
        compliance: item.compliance || []
      }))

      // Set pagination metadata
      if (response.data.pagination) {
        setTotalRows(Number(response.data.pagination.totalItems))
        setTotalPages(Number(response.data.pagination.totalPages))
      } else if (response.data.totalItems) {
        setTotalRows(response.data.totalItems)
        setTotalPages(Math.ceil(response.data.totalItems / params.limit))
      }

      setRows(transformedRows)
    } catch (error) {
      console.error('Error fetching affected events data:', error)
      setError(error.message || 'Failed to load data')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch detailed event compliance data for modal
  const fetchEventComplianceDetails = async (actId: number, eventName: string) => {
    setModalLoading(true)
    setModalError(null)

    try {
      const response = await axiosInstance.get(
        `/eventMaster/getEventComplianceShow?actId=${actId}&event=${encodeURIComponent(eventName)}`
      )

      if (response.data && response.data.success && response.data.data) {
        setModalData(response.data.data)
      } else {
        throw new Error('Invalid response from API')
      }
    } catch (error) {
      console.error('Error fetching event compliance details:', error)
      setModalError(error.message || 'Failed to load compliance details')
      setModalData([])
    } finally {
      setModalLoading(false)
    }
  }

  // Handle act chip click to open modal with details
  const handleActClick = (act: ComplianceAct, eventName: string) => {
    setSelectedEvent(eventName)
    setSelectedAct(act)
    setModalData([]) // Reset previous data
    setModalOpen(true)
    fetchEventComplianceDetails(act.act_id, eventName)
  }

  // Handle parameter changes
  const handleParamsChange = (newParams: Partial<ApiParams>) => {
    setApiParams(prevParams => {
      const updatedParams = { ...prevParams, ...newParams }

      // If search changes, reset to page 1
      if (newParams.search !== undefined) {
        updatedParams.page = 1
      }

      return updatedParams
    })
  }

  // Fetch data when parameters change
  useEffect(() => {
    fetchData(apiParams)
  }, [apiParams, fetchData])

  // Handle search change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== apiParams.search) {
        handleParamsChange({ search: searchValue, page: 1 }) // Reset to page 1 when search changes
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue, apiParams.search])

  // Handle pagination changes
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    handleParamsChange({
      page: model.page + 1, // Convert from 0-based to 1-based for API
      limit: model.pageSize
    })
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchData(apiParams)
  }

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      width: 80,
      sortable: false
    },
    {
      field: 'event',
      headerName: 'Event',
      width: 300,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => <Typography fontWeight={500}>{params.value}</Typography>
    },
    {
      field: 'compliance',
      headerName: 'Affected Acts',
      width: 600,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const complianceActs = params.value as ComplianceAct[]
        const eventName = params.row.event as string

        if (!complianceActs || complianceActs.length === 0) {
          return <Typography>None</Typography>
        }

        return (
          <div className='flex flex-wrap gap-1'>
            {complianceActs.map((item, index) => (
              <Chip
                key={index}
                label={item.name || `Act ID: ${item.act_id}`}
                size='small'
                color='primary'
                variant='outlined'
                onClick={() => handleActClick(item, eventName)}
                sx={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              />
            ))}
          </div>
        )
      }
    }
  ]

  // Show loading spinner when no rows and loading
  if (loading && rows.length === 0) {
    return (
      <Card>
        <CardHeader title='Affected Events & Acts' />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Affected Events & Acts'
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton onClick={handleRefresh} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <i className='tabler-refresh' />}
              </IconButton>
            </Box>
          }
        />

        <Divider />

        {/* Add search input */}
        <Box sx={{ p: 2 }}>
          <TextField
            size='small'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder='Search Events...'
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search text-xl' />
                </InputAdornment>
              ),
              endAdornment: searchValue ? (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setSearchValue('')}>
                    <i className='tabler-x' />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Box>

        <Divider />

        {/* Error message if API call fails */}
        {error && (
          <Alert severity='error' sx={{ mx: 3, mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* DataGrid for affected events and acts */}
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={totalRows}
          paginationMode='server'
          filterMode='server'
          loading={loading}
          disableRowSelectionOnClick
          disableColumnMenu
          autoHeight
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 70}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 2
            },
            '& .MuiDataGrid-virtualScroller': {
              minHeight: '300px'
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(224, 224, 224, 1)'
            }
          }}
          hideFooterSelectedRowCount
          slots={{
            pagination: CustomPagination
          }}
          slotProps={{
            pagination: {
              labelRowsPerPage: 'Show:',
              showFirstButton: true,
              showLastButton: true
            }
          }}
        />
      </Card>

      {/* Modal for detailed event compliance information */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth='lg'
        fullWidth
        aria-labelledby='event-compliance-details-dialog'
      >
        <DialogTitle id='event-compliance-details-dialog'>
          {selectedAct ? (
            <Typography variant='h6'>
              Compliance Details for <strong>{selectedAct.name}</strong>
              <Typography variant='subtitle1' color='textSecondary'>
                Event: {selectedEvent}
              </Typography>
            </Typography>
          ) : (
            'Compliance Details'
          )}
        </DialogTitle>

        <DialogContent dividers>
          {modalLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : modalError ? (
            <Alert severity='error'>{modalError}</Alert>
          ) : modalData.length > 0 ? (
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label='compliance details table'>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Rule</TableCell>
                    <TableCell>Sub Head</TableCell>
                    <TableCell>Criticality</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalData.map(row => (
                    <TableRow key={row.compliance_id}>
                      <TableCell>{row.compliance_id}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            maxWidth: '250px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={row.compliance_description}
                        >
                          {row.compliance_description || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.compliance_section || 'N/A'}</TableCell>
                      <TableCell>{row.compliance_rule || 'N/A'}</TableCell>
                      <TableCell>{row.compliance_sub_head || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.compliance_criticality || 'N/A'}
                          color={
                            row.compliance_criticality === 'High'
                              ? 'error'
                              : row.compliance_criticality === 'Medium'
                                ? 'warning'
                                : 'success'
                          }
                          size='small'
                          variant='tonal'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ p: 2 }}>No compliance details found for this selection.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShowAffectedEvent
