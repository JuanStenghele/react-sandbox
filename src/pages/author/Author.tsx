import { Box, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router';
import AuthorForm from './Form';
import LoadingPage from '../Loading';
import { useGetAuthor } from '../../services/authors';
import type { Author } from '../../types/author';
import { useTranslation } from 'react-i18next';

interface AuthorLocationState {
  author?: Author;
}

const AuthorPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const { author: stateAuthor } = (location.state as AuthorLocationState | null) ?? {};
  const { data: fetchedAuthor, isLoading } = useGetAuthor(id, !stateAuthor);

  const author = stateAuthor ?? fetchedAuthor;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        {author ? t('authorForm.editTitle') : t('authorForm.newTitle')}
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <AuthorForm author={author} />
      </Box>
    </Box>
  );
};

export default AuthorPage;
