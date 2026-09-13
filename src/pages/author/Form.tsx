import { Box, Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../constants';
import { usePatchAuthor, usePostAuthor } from '../../services/authors';
import type { Author } from '../../types/author';
import { useTranslation } from 'react-i18next';

export interface AuthorPageProps {
  author?: Author;
}

interface AuthorFormInput {
  name: string;
}

const AuthorForm = (props: AuthorPageProps) => {
  const isEditMode = !!props.author;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mutate: postMutate, isPending: isPostPending } = usePostAuthor();
  const { mutate: patchMutate, isPending: isPatchPending } = usePatchAuthor();
  const isPending = isPostPending || isPatchPending;

  const { control, handleSubmit, formState: { isValid, isDirty } } = useForm<AuthorFormInput>({
    defaultValues: { name: props.author?.name ?? '' },
  });

  const navigateToAuthorsPage = () => {
    navigate(ROUTES.authors);
  };

  const onSubmit: SubmitHandler<AuthorFormInput> = (data: AuthorFormInput) => {
    if (isEditMode) {
      patchMutate({ id: props.author!.id, data }, {
        onSuccess: () => {
          navigateToAuthorsPage();
        }
      });
    } else {
      postMutate(data, {
        onSuccess: () => {
          navigateToAuthorsPage();
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
              label={t('common.id')}
              sx={{
                width: '100%',
                maxWidth: 726.0
              }}
              value={props.author!.id}
              disabled
            />
          )
        }
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              required
              label={t('common.name')}
              slotProps={{
                htmlInput: {
                  maxLength: 128
                }
              }}
              sx={{
                width: '100%',
                maxWidth: 726.0
              }}
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
          onClick={navigateToAuthorsPage}
          disabled={isPending}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type='submit'
          variant='contained'
          size='large'
          startIcon={<SaveIcon />}
          sx={{ width: 148.0 }}
          disabled={!isValid || !isDirty}
          loadingPosition='start'
          loading={isPending}
          disableElevation
        >
          {t('common.save')}
        </Button>
      </Box>
    </Box>
  );
};

export default AuthorForm;
