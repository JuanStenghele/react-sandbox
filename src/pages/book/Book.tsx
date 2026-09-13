import { Box, Typography } from '@mui/material';
import { useLocation, useParams } from 'react-router';
import LoadingPage from '../Loading';
import type { Book } from '../../types/book';
import { useGetBook } from '../../services/books';
import BookForm from './form/Form';
import { useTranslation } from 'react-i18next';

interface BookLocationState {
  book?: Book;
}

const BookPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const { book: stateBook } = (location.state as BookLocationState | null) ?? {};
  const { data: fetchedBook, isLoading } = useGetBook(id, !stateBook);

  const book = stateBook ?? fetchedBook;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        {book ? t('bookForm.editTitle') : t('bookForm.newTitle')}
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <BookForm book={book} />
      </Box>
    </Box>
  );
};

export default BookPage;
