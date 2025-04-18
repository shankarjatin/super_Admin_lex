import Grid from '@mui/material/Grid'

// Component Imports

import ActTypeTable from '@/views/apps/act-type/ActTypeTable'

const ActType = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ActTypeTable />
      </Grid>
    </Grid>
  )
}

export default ActType
