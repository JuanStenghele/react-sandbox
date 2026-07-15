import { Navigate } from 'react-router';
import { Paper } from '@mui/material';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from 'react-oidc-context';

const LoginPage = () => {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
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
      bgcolor: '#1976d2'
    }}>
      <Paper elevation={3} sx={{ 
        width: '30%',
        marginX: 'auto', 
        padding: 4,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant='h3' align='center'>
            React Sandbox
          </Typography>
          <Typography variant='h5' align='center' sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            by Juan Stenghele
          </Typography>
        </Box>
        <Button variant='contained' aria-label='sign-in-button' onClick={onSignInButtonClick} sx={{ alignSelf: 'center' }}>
          SIGN IN
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
