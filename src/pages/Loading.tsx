import { Box, CircularProgress } from '@mui/material';

const LoadingPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <CircularProgress  size='4rem' aria-label='loading-spinner' />
    </Box>
  )
};

export default LoadingPage;
