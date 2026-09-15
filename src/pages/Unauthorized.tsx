import { Paper } from '@mui/material';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { useTranslation } from 'react-i18next';

const UnauthorizedPage = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      height: '100vh', 
      bgcolor: 'primary.main'
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
          {t('errors.unauthorizedAccess')}
        </Typography>
        <Typography variant='h5' align='center' sx={{ color: 'text.secondary' }}>
          403
        </Typography>
      </Paper>
    </Box>
  );
};

export default UnauthorizedPage;
