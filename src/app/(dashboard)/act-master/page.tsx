import Grid from '@mui/material/Grid'

// Component Imports
import ActDataGrid from '@/views/apps/act-master/ActListTable'

const ActMaster = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ActDataGrid />
      </Grid>
    </Grid>
  )
}

export default ActMaster
