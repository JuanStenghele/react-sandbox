import { Box, Typography, Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AuthorsTable from './table/Table';
import { useNavigate } from 'react-router';
import { adminScope, ROUTES } from '../../constants';
import { useHasPermission } from '../../services/auth';
  
const AuthorsPage = () => {
  const isUserAdmin = useHasPermission(adminScope);
  const navigate = useNavigate();

  const onNewButtonClick = () => {
    navigate(ROUTES.newAuthor);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        Authors
      </Typography>
      <Box sx={{ mb: 2.0 }}>
        <Button
          variant='contained'
          size='large'
          onClick={onNewButtonClick}
          startIcon={<AddRoundedIcon />}
          sx={{ width: 124.0 }}
          disabled={!isUserAdmin}
          disableElevation
        >
          New
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <AuthorsTable />
      </Box>
    </Box>
  );
}

export default AuthorsPage
