import { Box, Typography } from '@mui/material';
import AuthorForm from './Form';

const AuthorPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        New Author
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <AuthorForm />
      </Box>
    </Box>
  );
};

export default AuthorPage;
