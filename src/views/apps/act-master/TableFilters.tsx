// React Imports
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import ClickAwayListener from '@mui/material/ClickAwayListener'

// Type Imports
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Define an interface that extends ProductType but includes the specific fields in your data
interface ActType extends ProductType {
  name?: string
  description?: string
  country?: string
  scope?: string
  subject?: string
  type?: string
  complianceCount?: number
}

const TableFilters = ({
  setData,
  productData,
  onActSelect
}: {
  setData: (data: ProductType[]) => void
  productData?: ProductType[]
  onActSelect?: (actId: number) => void
}) => {
  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [filteredActs, setFilteredActs] = useState<ActType[]>([])

  // Use useRef for the search input element
  const searchInputRef = useRef<HTMLDivElement | null>(null)
  const isInitialRender = useRef(true)

  // Extract unique countries and types from product data
  const countries = useMemo(() => {
    if (!productData) return []

    const uniqueCountries = [
      ...new Set(productData.map(product => (product as ActType).country || '').filter(country => !!country))
    ]

    return uniqueCountries.sort()
  }, [productData])

  const types = useMemo(() => {
    if (!productData) return []

    const uniqueTypes = [...new Set(productData.map(product => (product as ActType).type || '').filter(type => !!type))]

    return uniqueTypes.sort()
  }, [productData])

  // Handle act selection from the search results
  const handleActSelect = (actId: number) => {
    if (onActSelect) {
      onActSelect(actId)
    }
    setFilteredActs([])
    setSearchTerm('')
  }

  // Search function that focuses on name field - memoized to prevent unnecessary recreations
  const actMatchesSearch = useCallback((act: ActType, term: string): boolean => {
    if (!term.trim()) return true

    const lowercaseTerm = term.toLowerCase()

    // Search only by name/productName
    return Boolean(
      act.name?.toLowerCase().includes(lowercaseTerm) || act.productName?.toLowerCase().includes(lowercaseTerm)
    )
  }, [])

  // Filter acts based on search term for dropdown
  useEffect(() => {
    if (searchTerm.trim() && productData?.length) {
      const filtered = productData
        .filter(product => {
          const act = product as ActType
          return (
            act.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            act.productName?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })
        .slice(0, 10) // Limit to 10 results for performance

      setFilteredActs(filtered as ActType[])
    } else {
      setFilteredActs([])
    }
  }, [searchTerm, productData])

  // Filter data based on all filters
  useEffect(() => {
    // Skip first render to prevent infinite loop on initialization
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    if (!productData) return

    const filteredData = productData.filter(product => {
      const act = product as ActType

      // Apply search term filter
      if (!actMatchesSearch(act, searchTerm)) return false

      // Apply country filter
      if (countryFilter && act.country !== countryFilter) return false

      // Apply type filter
      if (typeFilter && act.type !== typeFilter) return false

      return true
    })

    setData(filteredData)
  }, [searchTerm, countryFilter, typeFilter, productData, setData, actMatchesSearch])

  return (
    <CardContent>
      <Grid container spacing={6}>
        {/* <Grid item xs={12} sm={4}>
          <div ref={searchInputRef}>
            <CustomTextField
              fullWidth
              placeholder='Search by act name...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-search' />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position='end' style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')}>
                    <i className='tabler-x' />
                  </InputAdornment>
                )
              }}
            />
          </div>

          {/* Search results dropdown */}
        <Popper
          open={filteredActs.length > 0}
          anchorEl={searchInputRef.current}
          placement='bottom-start'
          style={{ width: searchInputRef.current?.clientWidth, zIndex: 1300 }}
        >
          <ClickAwayListener onClickAway={() => setFilteredActs([])}>
            <Paper elevation={4} sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {filteredActs.map((act, index) => (
                  <ListItem
                    key={act.id || index}
                    onClick={() => handleActSelect(Number(act.id))}
                    divider
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <ListItemText
                      primary={act.name || act.productName}
                      primaryTypographyProps={{ noWrap: true }}
                      secondary={act.country || 'Unknown location'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        </Popper>
        {/* </Grid>  */}

        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            id='select-country'
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            placeholder='Filter by country'
          >
            <MenuItem value=''>All Countries</MenuItem>
            {countries.map(country => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            id='select-type'
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            placeholder='Filter by type'
          >
            <MenuItem value=''>All Types</MenuItem>
            {types.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
