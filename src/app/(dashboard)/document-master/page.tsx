'use client'

// Component Imports
import React, { useEffect, useState, useCallback } from 'react'
import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import axios from 'axios'
import https from 'https'
import { CircularProgress, Alert, CardHeader, Card, Button } from '@mui/material'
import InternationalActTable from '@/views/apps/act-master/InternationalActTable'
import DocumentMasterTable from '@/views/apps/document-master/DocumentMasterTable'
import AddDocument from '@/components/dialogs/add-document'
import CopyLibrary from '@/components/dialogs/add-document/copyLibrary'

// Create a custom axios instance that bypasses SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

// Define the type for the dropdown API response
interface InternationalActOption {
  id: number
  actId: number
  name: string
  type?: string
}

// Define the type for the document list API response
interface DocumentListResponse {
  success: boolean
  statusCode: number
  message: string
  data: DocumentItem[]
}

// Define the type for document item
interface DocumentItem {
  sr: number
  docname: string
  act_id: number
  compliance_id: number
  doc_title: string
  status: number
  doc_url: string
  e_date: string
  datetime: string
  isDeleted: string
}

// Define the type for table data
interface DocumentTableData {
  id: string
  name?: string
  documentName?: string
  documentTitle?: string
  status?: string
  documentUrl?: string
  dateTime?: string
  act_id?: number
  compliance_id?: number
  // Fields required by the table component
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

const DocumentMaster = () => {
  const [options, setOptions] = useState<InternationalActOption[]>([])
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedAct, setSelectedAct] = useState<InternationalActOption | null>(null)
  const [documents, setDocuments] = useState<DocumentTableData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [copyLibraryOpen, setCopyLibraryOpen] = useState(false)

  // Fetch dropdown options from the API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('https://ai.lexcomply.co/v2/api/documentMaster/getDocumentActDrop', {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = response.data // API response data
        console.log('Dropdown options loaded:', data.length, 'items')
        setOptions(data) // Update state with fetched data
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        setOptions([]) // Set empty array in case of error
        setError('Failed to load acts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [])

  // Function to fetch document details when an act is selected
  const fetchActDetails = useCallback(async (actId: number) => {
    try {
      setDetailsLoading(true)
      setError(null)

      console.log(`Fetching documents for act ID: ${actId}`)

      // Use our custom axios instance to handle SSL issues
      const response = await axiosInstance.get<DocumentListResponse>(
        `https://ai.lexcomply.co/v2/api/documentMaster/getDocumentList?id=${actId}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Raw API response:', response)
      console.log('Document details response:', response.data)

      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        // Map the API response to the format expected by the table component
        const formattedData = response.data.data.map((doc: DocumentItem) => {
          console.log('Processing document:', doc)
          return {
            id: doc.sr.toString(),
            name: doc.docname || 'Untitled Document',
            documentName: doc.docname || 'Untitled Document',
            // Map to fields expected by InternationalActTable
            productName: doc.docname || 'Untitled Document',
            description: doc.doc_title || '',
            documentTitle: doc.doc_title || '',
            status: doc.status === 1 ? 'Active' : 'Inactive',
            documentUrl: doc.doc_url || '',
            dateTime: doc.datetime !== '0000-00-00 00:00:00' ? doc.datetime : 'Not available',
            act_id: doc.act_id,
            compliance_id: doc.compliance_id,
            country: '', // Not applicable for documents
            state: '',
            city: '',
            category: '',
            continent: '',
            region: '',
            type: '',
            subject: '',
            scope: '',
            // Required by ProductType
            sku: `DOC-${doc.sr}`,
            stock: true,
            qty: 1
          }
        })

        console.log('Formatted document data for table:', formattedData)
        setDocuments(formattedData)
      } else {
        console.error('Invalid or empty response format for document details', response.data)
        setDocuments([])
        setError('No documents found for the selected act.')
      }
    } catch (error) {
      console.error('Error fetching document details:', error)
      setDocuments([])
      setError('Failed to load document details. Please try again later.')
    } finally {
      setDetailsLoading(false)
    }
  }, [])

  // Handle act selection from dropdown
  const handleActChange = (event: any, newValue: InternationalActOption | null) => {
    console.log('Selected value:', newValue)
    setSelectedAct(newValue)

    if (newValue && newValue.id) {
      console.log(`Selected Act ID: ${newValue.id}, Name: ${newValue.name}`)

      // Fetch documents for the selected act
      console.log('Fetching documents now...')
      fetchActDetails(newValue.id)
    } else {
      console.log('No act selected, clearing document list...')
      // Clear the details if no act is selected
      setDocuments([])
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Document Master'
          action={
            <div className='flex gap-4'>
              <Button variant='contained' onClick={() => setOpenModal(true)} startIcon={<i className='tabler-plus' />}>
                Add Document
              </Button>
              <Button
                variant='contained'
                onClick={() => setCopyLibraryOpen(true)}
                startIcon={<i className='tabler-copy' />}
              >
                Copy Library
              </Button>
            </div>
          }
        />
      </Card>
      <div className='flex flex-col gap-6 mt-10'>
        {/* Show error message if there's an error */}
        {error && (
          <Alert severity='error' sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Autocomplete dropdown */}
        <div className='w-full'>
          <CustomAutocomplete
            fullWidth
            options={options}
            value={selectedAct}
            loading={loading}
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
                      {loading ? <CircularProgress color='inherit' size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </div>

        {/* Show loading indicator while fetching details */}
        {detailsLoading && (
          <div className='flex justify-center py-4'>
            <CircularProgress />
          </div>
        )}

        {/* Pass the fetched data to the table component */}
        {!detailsLoading && documents.length > 0 && (
          <>
            <DocumentMasterTable productData={documents} />
          </>
        )}

        {/* Show a message when no act is selected yet */}
        {!detailsLoading && documents.length === 0 && !error && (
          <div className='text-center py-8 text-textSecondary'>
            Please select an act from the dropdown to view its documents.
          </div>
        )}
      </div>
      <AddDocument open={openModal} setOpen={setOpenModal} />
      <CopyLibrary open={copyLibraryOpen} setOpen={setCopyLibraryOpen} />
      {/* Add your document add/edit modal component here */}
      {/* <AddEditDocument open={openModal} setOpen={setOpenModal} /> */}
    </>
  )
}

export default DocumentMaster
