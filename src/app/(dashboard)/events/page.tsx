import Grid from '@mui/material/Grid'

// Component Imports
import TabsBasic from '@/views/apps/events/EventsMain'

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
