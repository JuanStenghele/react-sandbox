import { Box, Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useForm, Controller, type SubmitHandler, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../constants';
import type { Book } from '../../../types/book';
import AuthorSelector from './AuthorSelector';
import BookCoverImagePicker from './CoverImagePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDeleteBookCover, usePatchBook, usePostBook } from '../../../services/books';

export interface BookPageProps {
  book?: Book;
}

interface BookFormInput {
  title: string;
  description: string;
  isbn: string;
  publicationDate: Date | null;
  authorId: string;
  coverImage: File | null;
}

const BookForm = (props: BookPageProps) => {
  const isEditMode = !!props.book;
  const navigate = useNavigate();
  const [showExternalImage, setShowExternalImage] = useState(props.book?.cover_image_url != null);
  const { mutateAsync: postMutate, isPending: isPostPending } = usePostBook();
  const { mutateAsync: patchMutate, isPending: isPatchPending } = usePatchBook();
  const { mutateAsync: deleteCoverMutate, isPending: isDeleteCoverPending } = useDeleteBookCover();
  const isPending = isPostPending || isPatchPending || isDeleteCoverPending;

  // Allow publication dates from year 1 to the present
  const minDate = new Date(0);
  minDate.setFullYear(1, 0, 1);

  const { control, handleSubmit, formState: { isValid, isDirty } } = useForm<BookFormInput>({
    defaultValues: {
      title: props.book?.title ?? '',
      description: props.book?.description ?? '',
      isbn: props.book?.isbn ?? '',
      publicationDate: props.book?.publication_date ?? null,
      authorId: props.book?.author_id ?? '',
      coverImage: null
    }
  });

  const navigateToBooksPage = () => {
    navigate(ROUTES.books);
  };

  const coverImage = useWatch({
    control,
    name: 'coverImage'
  });

  const shouldDeleteCoverImage = (): boolean => {
    return !showExternalImage && coverImage === null && Boolean(props.book?.cover_image_url);
  }

  const wereChangesMade = (): boolean => {
    return isDirty || shouldDeleteCoverImage();
  };

  const onSubmit: SubmitHandler<BookFormInput> = async (data: BookFormInput) => {
    if (isEditMode) {
      if (isDirty) {
        await patchMutate({ 
          id: props.book!.id, 
          data: {
            title: data.title,
            author_id: data.authorId,
            description: data.description,
            isbn: data.isbn,
            publication_date: data.publicationDate ?? undefined,
            cover_image: data.coverImage ?? undefined
          }
        });
      }
      // User wants to delete the cover image
      if (shouldDeleteCoverImage()) {
        await deleteCoverMutate(props.book!.id);
      }
      navigateToBooksPage();
    } else {
      await postMutate({
        title: data.title,
        author_id: data.authorId,
        description: data.description,
        isbn: data.isbn,
        publication_date: data.publicationDate ?? undefined,
        cover_image: data.coverImage ?? undefined
      });
      navigateToBooksPage();
    }
  };

  const publicationDatePickerComponent = () => {
    return <Controller
      name='publicationDate'
      control={control}
      render={({ field }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            {...field}
            disableFuture
            label='Publication Date'
            minDate={minDate}
            format='dd/MM/yyyy'
            sx={{
              width: '100%',
              maxWidth: 726.0
            }}
          />
        </LocalizationProvider>
      )}
    />
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 4.0, height: '100%' }}
    >
      <Box 
        sx={{ display: 'flex', flexDirection: 'column', gap: 4.0, flexGrow: 1, minHeight: 0, overflowY: 'auto', paddingTop: 2.0, marginTop: -2.0 }}
      >
        <Box 
          sx={{ display: 'flex', gap: 4.0 }}
        >
          <Controller
            name='coverImage'
            control={control}
            render={({ field }) => (
              <BookCoverImagePicker
                {...field}
                width={300.0}
                height={320.0}
                existingImageURL={props.book?.cover_image_url ?? undefined}
                showExternalImage={showExternalImage}
                onShowExternalImageChange={setShowExternalImage}
              />
            )}
          />
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
              rules={{ required: true }}
              render={({ field }) => (
                <AuthorSelector
                  {...field}
                  width={726.0}
                />
              )}
            />
            {
              !isEditMode && publicationDatePickerComponent()
            }
          </Box>
        </Box>
        {
          isEditMode && publicationDatePickerComponent()
        }
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4.0, flexGrow: 1 }}>
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Description'
                multiline
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': {
                    resize: 'vertical',
                    overflow: 'auto',
                    minHeight: '96px',
                    maxHeight: '256px'
                  }
                }}
              />
            )}
          />
        </Box>
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
          disabled={!isValid || !wereChangesMade()}
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
