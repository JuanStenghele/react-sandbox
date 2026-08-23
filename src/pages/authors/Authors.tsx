import { Box, Typography, Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthorsTable from './table/Table';
import { useNavigate } from 'react-router';
import { adminScope, ROUTES } from '../../constants';
import { useHasPermission } from '../../services/auth';
import { useAtomValue } from 'jotai';
import { selectedAuthorRowsIds } from '../../state/authors';
import { useDeleteAuthors } from '../../services/authors';
  
const AuthorsPage = () => {
  const isUserAdmin = useHasPermission(adminScope);
  const navigate = useNavigate();
  const selectedRowsIds = useAtomValue(selectedAuthorRowsIds);

  const { mutate, isPending: isDeletePending } = useDeleteAuthors();

  const onNewButtonClick = () => {
    navigate(ROUTES.newAuthor);
  };

  const isDeleteButtonDisabled = !isUserAdmin || selectedRowsIds.size === 0;

  const onDeleteButtonClick = () => {
    mutate({ ids: [...selectedRowsIds] });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        Authors
      </Typography>
      <Box sx={{ mb: 2.0, display: 'flex', gap: 1.0 }}>
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
        <Button
          variant='contained'
          color='error'
          size='large'
          onClick={onDeleteButtonClick}
          startIcon={<DeleteIcon />}
          sx={{ width: 124.0 }}
          disabled={isDeleteButtonDisabled}
          loadingPosition='start'
          loading={isDeletePending}
          disableElevation
        >
          Delete
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <AuthorsTable />
      </Box>
    </Box>
  );
}

export default AuthorsPage
