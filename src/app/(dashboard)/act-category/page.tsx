import Grid from '@mui/material/Grid'

// Component Imports
import ActDataGrid from '@/views/apps/act-master/ActListTable'
import TabsBasic from '@/views/apps/act-category/ActCategoryMain'

const ActMaster = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabsBasic />
      </Grid>
    </Grid>
  )
}

export default ActMaster
