import { Box, Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../constants';
import type { Book } from '../../types/book';
import AuthorSelector from './AuthorSelector';
import BookCoverImagePicker from './CoverImagePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { usePatchBook, usePostBook } from '../../services/books';

export interface BookPageProps {
  book?: Book;
}

interface BookFormInput {
  title: string;
  description: string;
  isbn: string;
  publicationDate: Date;
  authorId: string;
  coverImage: File;
}

const BookForm = (props: BookPageProps) => {
  const isEditMode = !!props.book;
  const navigate = useNavigate();
  const { mutate: postMutate, isPending: isPostPending } = usePostBook();
  const { mutate: patchMutate, isPending: isPatchPending } = usePatchBook();
  const isPending = isPostPending || isPatchPending;

  const minDate = new Date(0);
  minDate.setFullYear(1, 0, 1);

  const { control, handleSubmit, formState: { isValid } } = useForm<BookFormInput>({
    defaultValues: {
      title: props.book?.title ?? '',
      description: props.book?.description ?? '',
      isbn: props.book?.isbn ?? '',
      publicationDate: props.book?.publication_date ?? new Date(),
      authorId: props.book?.author_id ?? ''
    }
  });

  const navigateToBooksPage = () => {
    navigate(ROUTES.books);
  };

  const onSubmit: SubmitHandler<BookFormInput> = (data: BookFormInput) => {
    if (isEditMode) {
      patchMutate({ 
        id: props.book!.id, 
        data: {
          title: data.title,
          author_id: data.authorId,
          description: data.description,
          isbn: data.isbn,
          publication_date: data.publicationDate       
        }}, {
        onSuccess: () => {
          navigateToBooksPage();
        }
      });
    } else {
      postMutate({
        title: data.title,
        author_id: data.authorId,
        description: data.description,
        isbn: data.isbn,
        publication_date: data.publicationDate,
        cover_image: data.coverImage
      }, {
        onSuccess: () => {
          navigateToBooksPage();
        }
      });
    }
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.0, height: '100%' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4.0, flexGrow: 1 }}>
        {
          isEditMode && (
            <TextField
              label='ID'
              sx={{
                width: '100%',
                maxWidth: 726.0
              }}
              value={props.book!.id}
              disabled
            />
          )
        }
        <Controller
          name='title'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              required
              label='Title'
              sx={{
                width: '100%',
                maxWidth: 726.0
              }}
            />
          )}
        />
        <Controller
          name='isbn'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='ISBN'
              sx={{
                width: '100%',
                maxWidth: 726.0
              }}
            />
          )}
        />
        <Controller
          name='authorId'
          control={control}
          render={({ field }) => (
            <AuthorSelector
              {...field}
              width={726.0}
            />
          )}
        />
        <Controller
          name='publicationDate'
          control={control}
          render={({ field }) => (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                {...field}
                disableFuture
                label='Publication Date'
                minDate={minDate}
                sx={{
                  width: '100%',
                  maxWidth: 726.0
                }}
              />
            </LocalizationProvider>
          )}
        />
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Description'
              multiline
              rows={4}
              sx={{
                width: '100%'
              }}
            />
          )}
        />
        <Controller
          name='coverImage'
          control={control}
          render={({ field }) => (
            <BookCoverImagePicker
              {...field}
            />
          )}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2.0, justifyContent: 'flex-end' }}>
        <Button
          variant='outlined'
          size='large'
          startIcon={<CloseIcon />}
          sx={{ width: 148.0 }}
          onClick={navigateToBooksPage}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          variant='contained'
          size='large'
          startIcon={<SaveIcon />}
          sx={{ width: 148.0 }}
          disabled={!isValid}
          loadingPosition='start'
          loading={isPending}
          disableElevation
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default BookForm;
