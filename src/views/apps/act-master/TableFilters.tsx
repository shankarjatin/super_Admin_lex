// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'

// Type Imports
import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

type ProductStockType = { [key: string]: boolean }

// Vars
const productStockObj: ProductStockType = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({
  setData,
  productData,
  onCategoryChange
}: {
  setData: (data: ProductType[]) => void
  productData?: ProductType[]
  onCategoryChange?: (category: string) => void
}) => {
  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState<ProductType['category']>('')
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState<ProductType['status']>('')

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    if (value !== 'Accessories') {
      setStock('')
    }
    // Notify parent component about category change
    if (onCategoryChange) {
      onCategoryChange(value)
    }
  }

  // Search function to check if any field in the product contains the search term
  const productMatchesSearch = (product: ProductType, term: string): boolean => {
    if (!term.trim()) return true

    const lowercaseTerm = term.toLowerCase()

    // Check common fields that might exist in a product
    return (
      product.id?.toString().toLowerCase().includes(lowercaseTerm) ||
      product.productName?.toLowerCase().includes(lowercaseTerm) ||
      product.category?.toLowerCase().includes(lowercaseTerm) ||
      product.status?.toLowerCase().includes(lowercaseTerm) ||
      product.price?.toString().toLowerCase().includes(lowercaseTerm) ||
      false
    )
  }

  useEffect(
    () => {
      const filteredData = productData?.filter(product => {
        // First apply search term filter
        if (!productMatchesSearch(product, searchTerm)) return false

        // Then apply the other filters
        if (category && product.category !== category) return false
        if (stock && product.stock !== productStockObj[stock]) return false
        if (status && product.status !== status) return false

        return true
      })

      setData(filteredData ?? [])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchTerm, category, stock, status, productData]
  )

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            fullWidth
            placeholder='Search products...'
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
        </Grid>
        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            id='select-category'
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All act</MenuItem>
            <MenuItem value='Accessories'>International act</MenuItem>
          </CustomTextField>
        </Grid>
        {category === 'Accessories' && (
          <Grid item xs={12} sm={4}>
            <CustomTextField
              select
              fullWidth
              id='select-stock'
              value={stock}
              onChange={e => setStock(e.target.value as string)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value=''>Select Stock</MenuItem>
              <MenuItem value='In Stock'>In Stock</MenuItem>
              <MenuItem value='Out of Stock'>Out of Stock</MenuItem>
            </CustomTextField>
          </Grid>
        )}
      </Grid>
    </CardContent>
  )
}

export default TableFilters
