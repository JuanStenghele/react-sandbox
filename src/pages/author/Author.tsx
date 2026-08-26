import { Box, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router';
import AuthorForm from './Form';
import LoadingPage from '../Loading';
import { useGetAuthor } from '../../services/authors';
import type { Author } from '../../types/author';

interface AuthorLocationState {
  author?: Author;
}

const AuthorPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const { author: stateAuthor } = (location.state as AuthorLocationState | null) ?? {};
  const { data: fetchedAuthor, isLoading } = useGetAuthor(id, !stateAuthor);

  const author = stateAuthor ?? fetchedAuthor;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        {author ? 'Edit Author' : 'New Author'}
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <AuthorForm author={author} />
      </Box>
    </Box>
  );
};

export default AuthorPage;
