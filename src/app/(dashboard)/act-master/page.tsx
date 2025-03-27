// MUI Imports
import Grid from '@mui/material/Grid'
import axios from 'axios'
import https from 'https'

// Component Imports
import ProductCard from '@/views/apps/act-master/ProductCard'
import ActListTable from '@/views/apps/act-master/ActListTable'

// Define types based on the API response structure
const agent = new https.Agent({
  rejectUnauthorized: false
})
interface ActFieldData {
  id: number
  act_id: string
  category: string
  continent: string
  country: string
  state: string
  city: string
  region: string
  isDeleted: string
}

interface ActTypeData {
  id: number
  act_id: string
  types_1: string
  types_2: string
  types_3: string
  types_4: string
  status: number
  date: string
  isDeleted: string
}

interface ComplianceData {
  complianceCount: number
}

interface ActMasterItem {
  actId: number
  name: string
  act_desc: string
  scope: string
  status: number
  state: string
  complianceData: ComplianceData
  actFieldData: ActFieldData[]
  actTypeData: ActTypeData[]
}

interface ActMasterResponse {
  success: boolean
  statusCode: number
  message: string
  data: ActMasterItem[]
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

// API fetch function using Axios instead of fetch
const getActMasterData = async (): Promise<ActMasterResponse> => {
  try {
    const response = await axios.get('https://ai.lexcomply.co/v2/api/actMaster/actMasterList', {
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: agent // Add the agent to disable SSL verification
    })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching act master data:', error)

    // Return an empty data structure that matches the expected format
    return {
      success: false,
      statusCode: 500,
      message: 'Error fetching data: ' + (error instanceof Error ? error.message : 'Unknown error'),
      data: []
    }
  }
}

// Map API data to the format expected by child components
const mapApiDataToTableFormat = (apiData: ActMasterItem[]) => {
  return apiData.map(act => {
    // Get the first item from arrays or provide defaults
    const fieldData = act.actFieldData?.[0] || {}
    const typeData = act.actTypeData?.[0] || {}

    return {
      // Map fields needed for the table
      id: act.actId.toString(),
      complianceCount: act.complianceData?.complianceCount || 0,
      type: typeData.types_1 || 'General',
      name: act.name,
      description: act.act_desc || '',
      country: fieldData.country || 'Global',
      scope: act.scope || 'National',
      subject: typeData.types_2 || 'General',
      status: mapStatusToString(act.status),

      // Additional fields required by ProductType interface
      productName: act.name,
      price: act.complianceData?.complianceCount || 0,
      qty: 1,
      category: fieldData.country || 'Global',
      sku: typeData.types_1 || 'General',
      stock: true
    }
  })
}

// Create a function to handle mock data in case the API fails
const getMockActMasterData = (): ActMasterResponse => {
  return {
    success: true,
    statusCode: 200,
    message: 'Mock data loaded successfully',
    data: [
      {
        actId: 104388,
        name: 'A Law to provide for the regulation of smoking in public places',
        act_desc:
          'A Law to provide for the regulation of smoking in public places in Lagos state and for connected purposes',
        scope: 'state',
        status: 1,
        state: 'Lagos',
        complianceData: {
          complianceCount: 12
        },
        actFieldData: [
          {
            id: 4145,
            act_id: '104388',
            category: 'Statutory',
            continent: 'Africa',
            country: 'Nigeria',
            state: 'Lagos',
            city: '',
            region: '',
            isDeleted: '0'
          }
        ],
        actTypeData: [
          {
            id: 5721,
            act_id: '104388',
            types_1: 'Environment, Health and Safety Laws',
            types_2: 'Public Health',
            types_3: '',
            types_4: '',
            status: 1,
            date: '2024-02-15T09:28:48.000Z',
            isDeleted: '0'
          }
        ]
      },
      {
        actId: 101998,
        name: 'A New Tax System (Australian Business Number) Act 1999',
        act_desc: 'A New Tax System (Australian Business Number) Act 1999',
        scope: 'central',
        status: 0,
        state: '',
        complianceData: {
          complianceCount: 5
        },
        actFieldData: [
          {
            id: 1755,
            act_id: '101998',
            category: 'Statutory',
            continent: 'Australia',
            country: 'Australia',
            state: '',
            city: '',
            region: '',
            isDeleted: '0'
          }
        ],
        actTypeData: [
          {
            id: 2529,
            act_id: '101998',
            types_1: 'Direct Taxation Laws',
            types_2: 'Business Registration',
            types_3: '',
            types_4: '',
            status: 1,
            date: '2022-08-04T08:52:27.000Z',
            isDeleted: '0'
          }
        ]
      }
    ]
  }
}

const ActMaster = async () => {
  // Try to fetch data from API, use mock data as fallback
  let actMasterResponse: ActMasterResponse

  try {
    // Try the real API first
    actMasterResponse = await getActMasterData()

    // If we got no data but no error was thrown, use mock data
    if (!actMasterResponse.success || !actMasterResponse.data || actMasterResponse.data.length === 0) {
      console.log('API returned no data, using mock data instead')
      actMasterResponse = getMockActMasterData()
    }
  } catch (error) {
    // In case of any unexpected error, fall back to mock data
    console.error('Unexpected error, using mock data:', error)
    actMasterResponse = getMockActMasterData()
  }

  // Safety check in case data is still undefined
  const acts = actMasterResponse.data || []

  // Map the API data to the format needed by the table component
  const mappedData = mapApiDataToTableFormat(acts)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ProductCard actCount={mappedData.length} />
      </Grid>
      <Grid item xs={12}>
        <ActListTable productData={mappedData} />
      </Grid>
    </Grid>
  )
}

export default ActMaster
