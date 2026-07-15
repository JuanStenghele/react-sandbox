import { Paper } from '@mui/material';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

const NotFoundPage = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      height: '100vh', 
      bgcolor: '#1976d2'
    }}>
      <Paper elevation={4.0} sx={{ 
        width: '30%',
        marginX: 'auto', 
        padding: 4.0,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <WarningRoundedIcon sx={{ fontSize: 64.0, marginBottom: 1.0 }}/>
        <Typography variant='h3' align='center' gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant='h5' align='center' sx={{ color: 'text.secondary' }}>
          404
        </Typography>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
