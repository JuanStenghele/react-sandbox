import { Box, Typography } from '@mui/material';
import NewAuthorForm from './Form';

const NewAuthorPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        New Author
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <NewAuthorForm />
      </Box>
    </Box>
  );
};

export default NewAuthorPage;
