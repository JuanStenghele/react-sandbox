import { Box, Typography } from '@mui/material';
import AuthorsTable from './table/Table';

const AuthorsPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        Authors
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <AuthorsTable />
      </Box>
    </Box>
  );
}

export default AuthorsPage
