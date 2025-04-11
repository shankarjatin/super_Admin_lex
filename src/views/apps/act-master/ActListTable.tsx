'use client'

import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridPaginationModel,
  gridPageCountSelector,
  useGridApiContext,
  useGridSelector,
  GridPagination
} from '@mui/x-data-grid'
import { ThemeColor } from '@core/types'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'

// Third-party Imports
import axios from 'axios'
import https from 'https'

// Component Imports
import AddEditAct from '@/components/dialogs/add-act'
import EditAct from '@/components/dialogs/edit-act'

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
  sortField?: string
  sortOrder?: 'ASC' | 'DESC'
  category?: string
}

// Map status number to status string
const mapStatusToString = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Inactive',
    1: 'Published',
    2: 'Scheduled',
    3: 'Draft'
  }
  return statusMap[status] || 'Unknown'
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

const ActDataGrid = () => {
  // States for data management
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalRows, setTotalRows] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // States for component interactions
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [searchValue, setSearchValue] = useState('')

  // State for API parameters
  const [apiParams, setApiParams] = useState<ApiParams>({
    page: 1,
    limit: 10
  })

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

      // Only add optional parameters if they exist
      if (params.search) {
        queryParams.append('search', params.search)
      }

      if (params.sortField) {
        queryParams.append('sortField', params.sortField)
      }

      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder)
      }

      if (params.category) {
        queryParams.append('category', params.category)
      }

      const response = await axiosInstance.get(`/actMaster/actMasterList?${queryParams.toString()}`)

      // Process the API response
      if (!response.data) {
        throw new Error('Invalid API response')
      }

      let actData = []

      // Handle different response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        actData = response.data.data
        // Set pagination metadata
        if (response.data.totalItems) {
          setTotalRows(response.data.totalItems)
          setTotalPages(Math.ceil(response.data.totalItems / params.limit))
        } else if (response.data.meta) {
          setTotalRows(response.data.meta.totalItems)
          setTotalPages(response.data.meta.totalPages)
        } else {
          setTotalRows(actData.length)
          setTotalPages(1)
        }
      } else if (Array.isArray(response.data)) {
        actData = response.data
        setTotalRows(actData.length)
        setTotalPages(1)
      } else {
        throw new Error('Unexpected API response format')
      }

      // Convert API data to row format for DataGrid
      const transformedRows = actData.map(act => {
        const fieldData = act.actFieldData?.[0] || {}
        const typeData = act.actTypeData?.[0] || {}

        return {
          id: act.actId,
          actId: act.actId,
          type: typeData.types_1 || 'General',
          name: act.name,
          description: act.act_desc || '',
          country: fieldData.country || 'Global',
          scope: act.scope || 'National',
          subject: typeData.types_2 || 'General',
          status: mapStatusToString(act.status),
          complianceCount: act.complianceData?.complianceCount || 0,
          rawData: act // Store full raw data for edit operations
        }
      })

      setRows(transformedRows)
    } catch (error) {
      console.error('Error fetching act master data:', error)
      setError(error.message || 'Failed to load data')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle parameter changes
  const handleParamsChange = (newParams: Partial<ApiParams>) => {
    setApiParams(prevParams => {
      const updatedParams = { ...prevParams, ...newParams }

      // If search or sort changes, reset to page 1
      if (newParams.search !== undefined || newParams.sortField || newParams.sortOrder) {
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

  // Handle data deletion
  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this act?')) {
      try {
        const response = await axiosInstance.delete('/actMaster/removeActMaster', {
          data: { id },
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.data) {
          alert('Act deleted successfully')
          fetchData(apiParams)
        } else {
          alert('Failed to delete act')
        }
      } catch (error) {
        console.error('Error deleting act:', error)
        alert('Error deleting act. Please try again.')
      }
    }
  }

  // Handle edit row data fetch
  const fetchRowData = async (id: string | number) => {
    try {
      const response = await axiosInstance.get(`/actMaster/getInternationalAct?id=${id}`)

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setEditingRow(response.data[0])
      } else {
        alert('Failed to fetch act details. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching act details:', error)
      alert('Error loading act details. Please try again.')
    }
  }

  // Handle sorting changes
  const handleSortModelChange = (sortModel: GridSortModel) => {
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0]
      handleParamsChange({
        sortField: field,
        sortOrder: sort === 'asc' ? 'ASC' : 'DESC'
      })
    } else {
      handleParamsChange({
        sortField: undefined,
        sortOrder: undefined
      })
    }
  }

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
    { field: 'actId', headerName: 'ID', width: 70 },
    {
      field: 'complianceCount',
      headerName: 'COMPLIANCE',
      type: 'number',
      width: 140,
      align: 'center',
      headerAlign: 'center'
    },
    { field: 'type', headerName: 'TYPE', width: 150 },
    { field: 'name', headerName: 'ACT NAME', width: 250 },
    { field: 'description', headerName: 'DESCRIPTION', width: 300 },
    { field: 'country', headerName: 'COUNTRY', width: 150 },
    { field: 'scope', headerName: 'SCOPE', width: 150 },
    { field: 'subject', headerName: 'SUBJECT', width: 150 },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 130,
      renderCell: params => {
        const status = params.value as string
        let color: ThemeColor = 'default'

        if (['Published', 'Active', 'Scheduled'].includes(status)) {
          color = 'success'
        } else if (['Inactive', 'Draft'].includes(status)) {
          color = 'error'
        }

        return <Chip label={status} color={color} variant='outlined' size='small' />
      }
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      sortable: false,
      filterable: false,
      width: 150,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size='small' onClick={() => fetchRowData(params.row.actId)}>
            <i className='tabler-edit text-primary' />
          </IconButton>
          <IconButton size='small' onClick={() => handleDelete(params.row.actId)}>
            <i className='tabler-trash text-error' />
          </IconButton>
          <IconButton size='small'>
            <i className='tabler-eye text-info' />
          </IconButton>
        </Box>
      )
    }
  ]

  // Convert API params to DataGrid sort model
  const getSortModel = (): GridSortModel => {
    if (apiParams.sortField) {
      return [
        {
          field: apiParams.sortField,
          sort: apiParams.sortOrder === 'ASC' ? 'asc' : 'desc'
        }
      ]
    }
    return []
  }

  // Show loading spinner when no rows and loading
  if (loading && rows.length === 0) {
    return (
      <Card>
        <CardHeader title='Acts Master' />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Acts Master'
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddModalOpen(true)}>
              Add Act
            </Button>
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
          placeholder='Search Acts...'
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

      {/* Simplified DataGrid with minimal props to avoid potential issues */}
      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        rowCount={totalRows}
        paginationMode='server'
        sortingMode='server'
        filterMode='server'
        sortModel={getSortModel()}
        onSortModelChange={handleSortModelChange}
        loading={loading}
        disableRowSelectionOnClick
        autoHeight
        getRowHeight={() => 'auto'}
        getEstimatedRowHeight={() => 60}
        sx={{
          '& .MuiDataGrid-cell': {
            py: 1.5
          },
          '& .MuiDataGrid-virtualScroller': {
            minHeight: '300px'
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(224, 224, 224, 1)'
          }
        }}
        hideFooterSelectedRowCount
        disableColumnMenu
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

      {/* Add Act Dialog */}
      <AddEditAct open={addModalOpen} setOpen={setAddModalOpen} onSuccess={handleRefresh} />

      {/* Edit Act Dialog */}
      {editingRow && (
        <EditAct
          open={!!editingRow}
          setOpen={open => !open && setEditingRow(null)}
          data={editingRow}
          onSuccess={handleRefresh}
        />
      )}
    </Card>
  )
}

export default ActDataGrid
