import Grid from '@mui/material/Grid'

// Component Imports
import InternationalActTable from '@/views/apps/act-master/InternationalActTable'

const ActMasterInternational = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <InternationalActTable />
      </Grid>
    </Grid>
  )
}

export default ActMasterInternational
