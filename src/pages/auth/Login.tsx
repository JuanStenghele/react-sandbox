import { Navigate } from 'react-router';
import { Paper } from '@mui/material';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from 'react-oidc-context';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const auth = useAuth();
  const { t } = useTranslation();

  if (auth.isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  const onSignInButtonClick = () => {
    auth.signinRedirect()
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      height: '100vh', 
      bgcolor: 'primary.main'
    }}>
      <Paper elevation={3.0} sx={{ 
        width: '30%',
        marginX: 'auto', 
        padding: 4.0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ marginBottom: 6.0 }}>
          <Typography variant='h3' align='center'>
            {t('app.title')}
          </Typography>
          <Typography variant='h5' align='center' sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {t('app.byline')}
          </Typography>
        </Box>
        <Button variant='contained' aria-label='sign-in-button' onClick={onSignInButtonClick} sx={{ alignSelf: 'center' }}>
          {t('common.signIn')}
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
